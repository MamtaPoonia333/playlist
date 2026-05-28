import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../utils/api';

const moodToGenres = {
	'😊 happy': ['Pop', 'Dance', 'Electronic', 'Indie'],
	'😲 surprised': ['Electronic', 'Pop', 'Hip-Hop'],
	'😴 sleepy': ['Ambient', 'Classical', 'Jazz', 'Folk'],
	'😠 angry': ['Rock', 'Metal', 'Hip-Hop'],
	'😐 neutral': ['Pop', 'R&B', 'Indie', 'Chill'],
	'sad': ['Ambient', 'R&B', 'Folk', 'Jazz'],
};

function normalizeMoodLabel(mood) {
	return (mood || '').toLowerCase().trim();
}

function getMoodGenres(mood) {
	const normalized = normalizeMoodLabel(mood);

	if (normalized.includes('happy')) return moodToGenres['😊 happy'];
	if (normalized.includes('surprised')) return moodToGenres['😲 surprised'];
	if (normalized.includes('sleepy')) return moodToGenres['😴 sleepy'];
	if (normalized.includes('angry')) return moodToGenres['😠 angry'];
	if (normalized.includes('neutral')) return moodToGenres['😐 neutral'];
	if (normalized.includes('sad')) return moodToGenres.sad;

	return moodToGenres['😐 neutral'];
}

function toSpotifyGenreSeed(genre) {
	return normalizeMoodLabel(genre)
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-');
}

export default function Recommandations({ mood }) {
	const [songs, setSongs] = useState([]);
	const [spotifyTracks, setSpotifyTracks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [source, setSource] = useState('local'); // 'local' or 'spotify'

	useEffect(() => {
		let ignore = false;

		async function loadSongs() {
			try {
				setLoading(true);
				setError('');

				const response = await fetch(apiUrl('/api/songs'), {
					credentials: 'include',
				});
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.message || 'Failed to load songs');
				}

				if (!ignore) {
					setSongs(Array.isArray(data.songs) ? data.songs : []);
				}
			} catch (fetchError) {
				if (!ignore) {
					setError(fetchError.message || 'Could not load playlist');
				}
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		}

		loadSongs();

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		// when user selects Spotify as source, fetch recommendations from backend
		let ignore = false;

		async function loadSpotify() {
			try {
				setLoading(true);
				setError('');

				const spotifyGenres = getMoodGenres(mood).map(toSpotifyGenreSeed).filter(Boolean);
				const params = new URLSearchParams({
					mood: mood || 'neutral',
					genres: spotifyGenres.join(','),
				});
				const res = await fetch(apiUrl(`/api/spotify/recommendations?${params.toString()}`), {
					method: 'GET',
					credentials: 'include'
				});

				const body = await res.json();

				if (!res.ok) {
					throw new Error(body.message || 'Spotify recommendations failed');
				}

				if (!ignore) {
					setSpotifyTracks(Array.isArray(body.recommendations) ? body.recommendations : []);
				}
			} catch (err) {
				if (!ignore) setError(err.message || 'Could not load Spotify recommendations');
			} finally {
				if (!ignore) setLoading(false);
			}
		}

		if (source === 'spotify') {
			loadSpotify();
		}

		return () => { ignore = true; };
	}, [source, mood]);

	const moodGenres = useMemo(() => getMoodGenres(mood), [mood]);

	const playlist = useMemo(() => {
		if (source === 'spotify') {
			return spotifyTracks.map((t) => ({
				id: t.id,
				title: t.name,
				artist: (t.artists || []).map((a) => a.name).join(', '),
				genre: t.genre || 'Unknown',
				imageUrl: (t.album && t.album.images && t.album.images[0] && t.album.images[0].url) || '',
				previewUrl: t.preview_url || null,
				externalUrl: t.external_urls?.spotify || null,
				createdAt: t.album?.release_date || '',
			}));
		}

		if (!songs.length) return [];

		const normalizedMood = normalizeMoodLabel(mood);

		const matchedSongs = songs.filter((song) => {
			const genre = normalizeMoodLabel(song.genre);
			const title = normalizeMoodLabel(song.title);
			const artist = normalizeMoodLabel(song.artist);

			return moodGenres.some((targetGenre) => {
				const target = normalizeMoodLabel(targetGenre);
				return genre.includes(target) || title.includes(normalizedMood) || artist.includes(normalizedMood);
			});
		});

		if (matchedSongs.length > 0) {
			return matchedSongs;
		}

		return songs.slice(0, 6);
	}, [mood, moodGenres, songs, spotifyTracks, source]);

	return (
		<section className="mt-8 w-full rounded-3xl border border-blue-500/20 bg-slate-950/90 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
			<div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
				<div>
					<p className="text-sm uppercase tracking-[0.25em] text-blue-300/70">Mood Playlist</p>
					<h2 className="text-2xl font-bold text-white">Recommended songs for {mood || 'your mood'}</h2>
					<p className="mt-1 text-sm text-slate-400">
						Matching your detected mood with genres like {moodGenres.join(', ')}.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
						{playlist.length} songs ready
					</div>
					<div className="flex gap-2">
						<button
							className={`px-3 py-1 rounded-full text-sm font-semibold ${source === 'local' ? 'bg-blue-500 text-white' : 'text-blue-200 border border-blue-500/20'}`}
							onClick={() => setSource('local')}
						>
							Local
						</button>
						<button
							className={`px-3 py-1 rounded-full text-sm font-semibold ${source === 'spotify' ? 'bg-green-500 text-white' : 'text-blue-200 border border-blue-500/20'}`}
							onClick={() => setSource('spotify')}
						>
							Spotify
						</button>
					</div>
					{source === 'spotify' && (
						<a href={apiUrl('/api/spotify/login')} className="ml-4 text-sm text-blue-300/90 underline">Connect Spotify</a>
					)}
				</div>
			</div>

			{loading && (
				<div className="rounded-2xl border border-dashed border-blue-500/30 bg-slate-900/70 p-6 text-center text-slate-300">
					Loading your playlist...
				</div>
			)}

			{error && !loading && (
				<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
					{error}
				</div>
			)}

			{!loading && !error && playlist.length === 0 && (
				<div className="rounded-2xl border border-blue-500/20 bg-slate-900/70 p-6 text-slate-300">
					No songs found yet. Upload some songs first so the playlist can be generated.
				</div>
			)}

			<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{playlist.map((song) => (
					<article
						key={song.id || song._id}
						className="group overflow-hidden rounded-2xl border border-blue-500/20 bg-linear-to-br from-slate-900 to-slate-950 transition hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-900/30"
					>
							<div className="h-36 bg-linear-to-br from-blue-600/80 via-slate-900 to-slate-950 p-4">
							<div className="flex h-full flex-col justify-between">
								<div className="flex items-center justify-between">
									<span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
										{song.genre || 'Unknown'}
									</span>
									<span className="text-xs text-blue-200/80">Mood match</span>
								</div>
								<div>
									<h3 className="text-xl font-bold text-white">{song.title}</h3>
									<p className="text-sm text-blue-100/80">by {song.artist}</p>
								</div>
							</div>
						</div>

						<div className="space-y-3 p-4">
							<div className="flex items-center justify-between text-sm text-slate-400">
								<span>Uploaded by {song.uploadedBy || (source === 'spotify' ? 'Spotify' : 'Unknown')}</span>
								<span>{song.createdAt ? new Date(song.createdAt).toLocaleDateString() : ''}</span>
							</div>

							<audio
								controls
								className="w-full rounded-lg"
								src={song.previewUrl || song.imageUrl}
							>
								Your browser does not support the audio element.
							</audio>

							<a
								href={song.externalUrl || song.imageUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
							>
								Open Track
							</a>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
