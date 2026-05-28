const cookieOptions = {
	httpOnly: true,
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production'
};

function getSpotifyConfig() {
	return {
		clientId: process.env.SPOTIFY_CLIENT_ID || process.env.SpotifyClient_ID || '',
		clientSecret: process.env.SPOTIFY_CLIENT_SECRET || process.env.SpotifyClient_Secret || '',
		redirectUri: process.env.SPOTIFY_REDIRECT_URI || process.env.SpotifyRedirect_URL || '',
		successRedirect: process.env.SPOTIFY_SUCCESS_REDIRECT || 'http://localhost:5173'
	};
}

function buildSpotifyAuthUrl() {
	const { clientId, redirectUri } = getSpotifyConfig();

	const params = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		redirect_uri: redirectUri,
		scope: [
			'user-read-private',
			'user-read-email',
			'user-top-read',
			'user-read-recently-played',
			'playlist-read-private',
			'playlist-modify-private',
			'playlist-modify-public'
		].join(' ')
	});

	return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
	const { clientId, clientSecret, redirectUri } = getSpotifyConfig();

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(
				`${clientId}:${clientSecret}`
			).toString('base64')}`
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Spotify token exchange failed: ${errorBody}`);
	}

	return response.json();
}

async function refreshSpotifyAccessToken(refreshToken) {
	const { clientId, clientSecret } = getSpotifyConfig();

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(
				`${clientId}:${clientSecret}`
			).toString('base64')}`
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Spotify refresh failed: ${errorBody}`);
	}

	return response.json();
}

async function spotifyApi(path, accessToken, options = {}) {
	const response = await fetch(`https://api.spotify.com/v1${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});

	if (response.status === 204) {
		return null;
	}

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Spotify API error for ${path}: ${errorBody}`);
	}

	return response.json();
}

function getTokensFromRequest(req) {
	return {
		accessToken: req.cookies?.spotifyAccessToken || req.headers.authorization?.split(' ')[1],
		refreshToken: req.cookies?.spotifyRefreshToken
	};
}

function normalizeMood(mood) {
	return (mood || '').toLowerCase().trim();
}

function moodTargets(mood) {
	const normalized = normalizeMood(mood);

	if (normalized.includes('happy')) {
		return { target_valence: 0.9, target_energy: 0.8, target_danceability: 0.8 };
	}
	if (normalized.includes('surprised')) {
		return { target_valence: 0.7, target_energy: 0.75, target_danceability: 0.7 };
	}
	if (normalized.includes('sleepy')) {
		return { target_valence: 0.35, target_energy: 0.25, target_acousticness: 0.8, target_tempo: 75 };
	}
	if (normalized.includes('angry')) {
		return { target_valence: 0.2, target_energy: 0.95, target_loudness: -5, target_tempo: 140 };
	}
	if (normalized.includes('sad')) {
		return { target_valence: 0.2, target_energy: 0.3, target_acousticness: 0.7 };
	}

	return { target_valence: 0.5, target_energy: 0.5, target_danceability: 0.5 };
}

function parseGenreList(value) {
	if (!value) {
		return [];
	}

	if (Array.isArray(value)) {
		return value;
	}

	return String(value)
		.split(',')
		.map((genre) => genre.trim())
		.filter(Boolean);
}

function normalizeSpotifyGenre(genre) {
	const normalized = normalizeMood(genre)
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-');

	const aliases = {
		'randb': 'r-n-b',
		'r-and-b': 'r-n-b',
		'r-b': 'r-n-b',
		'hip-hop': 'hip-hop',
		'hiphop': 'hip-hop',
		'electronic': 'electronic',
		'dance': 'dance',
		'classical': 'classical',
		'ambient': 'ambient',
		'chill': 'chill',
		'indie': 'indie'
	};

	return aliases[normalized] || normalized;
}

async function spotifyLoginController(req, res) {
	try {
		const { clientId, redirectUri } = getSpotifyConfig();

		if (!clientId || !redirectUri) {
			return res.status(500).json({ message: 'Spotify environment variables are not configured' });
		}

		return res.redirect(buildSpotifyAuthUrl());
	} catch (error) {
		console.error('spotifyLoginController error:', error.message || error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function spotifyCallbackController(req, res) {
	try {
		const code = req.query.code;
		const error = req.query.error;

		if (error) {
			return res.status(400).json({ message: `Spotify authorization failed: ${error}` });
		}

		if (!code) {
			return res.status(400).json({ message: 'Authorization code is required' });
		}

		const tokenData = await exchangeCodeForToken(code);
		const accessToken = tokenData.access_token;
		const refreshToken = tokenData.refresh_token;

		res.cookie('spotifyAccessToken', accessToken, {
			...cookieOptions,
			maxAge: tokenData.expires_in * 1000
		});

		if (refreshToken) {
			res.cookie('spotifyRefreshToken', refreshToken, cookieOptions);
		}

		const { successRedirect } = getSpotifyConfig();
		const redirectTo = successRedirect;
		return res.redirect(redirectTo);
	} catch (error) {
		console.error('spotifyCallbackController error:', error.message || error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function spotifyProfileController(req, res) {
	try {
		let { accessToken, refreshToken } = getTokensFromRequest(req);

		if (!accessToken && refreshToken) {
			const refreshed = await refreshSpotifyAccessToken(refreshToken);
			accessToken = refreshed.access_token;
			res.cookie('spotifyAccessToken', accessToken, {
				...cookieOptions,
				maxAge: refreshed.expires_in * 1000
			});
		}

		if (!accessToken) {
			return res.status(401).json({ message: 'Spotify not connected' });
		}

		const profile = await spotifyApi('/me', accessToken);
		return res.status(200).json({ profile });
	} catch (error) {
		console.error('spotifyProfileController error:', error.message || error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function spotifyRecommendationsController(req, res) {
	try {
		const mood = req.query.mood || req.body?.mood || 'neutral';
		const requestedGenres = parseGenreList(req.query.genres || req.body?.genres)
			.map(normalizeSpotifyGenre)
			.filter(Boolean);
		let { accessToken, refreshToken } = getTokensFromRequest(req);

		if (!accessToken && refreshToken) {
			const refreshed = await refreshSpotifyAccessToken(refreshToken);
			accessToken = refreshed.access_token;
			res.cookie('spotifyAccessToken', accessToken, {
				...cookieOptions,
				maxAge: refreshed.expires_in * 1000
			});
		}

		if (!accessToken) {
			return res.status(401).json({ message: 'Spotify not connected' });
		}

		const topTracks = await spotifyApi('/me/top/tracks?limit=5', accessToken);
		const seedTracks = (topTracks.items || []).map((track) => track.id).slice(0, 5);
		const targets = moodTargets(mood);
		const availableGenreSeeds = await spotifyApi('/recommendations/available-genre-seeds', accessToken);
		const availableGenres = new Set((availableGenreSeeds.genres || []).map((genre) => normalizeSpotifyGenre(genre)));
		const seedGenres = requestedGenres.filter((genre) => availableGenres.has(genre)).slice(0, 5);

		const params = new URLSearchParams({
			limit: '10',
			...Object.fromEntries(
				Object.entries(targets).map(([key, value]) => [key, String(value)])
			)
		});

		if (seedGenres.length > 0) {
			params.set('seed_genres', seedGenres.join(','));
		} else if (seedTracks.length > 0) {
			params.set('seed_tracks', seedTracks.join(','));
		} else {
			params.set('seed_genres', 'pop,rock,indie');
		}

		const recommendations = await spotifyApi(`/recommendations?${params.toString()}`, accessToken);
		return res.status(200).json({
			mood,
			genres: seedGenres,
			targets,
			recommendations: recommendations.tracks || []
		});
	} catch (error) {
		console.error('spotifyRecommendationsController error:', error.message || error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function spotifyLogoutController(req, res) {
	res.clearCookie('spotifyAccessToken', cookieOptions);
	res.clearCookie('spotifyRefreshToken', cookieOptions);
	return res.status(200).json({ message: 'Spotify disconnected' });
}

module.exports = {
	spotifyLoginController,
	spotifyCallbackController,
	spotifyProfileController,
	spotifyRecommendationsController,
	spotifyLogoutController
};
