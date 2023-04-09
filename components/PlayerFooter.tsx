import { GenericTrack } from '@/server/routers/searchProcedures'
import { Avatar, HStack, IconButton, Image, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import YouTube from 'react-youtube'
import { Options } from 'youtube-player/dist/types';
import { DEFAULT_COVER_ART_IMAGE } from './PlaylistView'
import SpotifyPlayer from 'react-spotify-web-playback';
import { FaPause, FaPlay, FaStepBackward, FaStepForward } from 'react-icons/fa';

const YOUTUBE_PLAYER_OPTS: Options = {
    height: "1",
    width: "1",
    host: `https://www.youtube.com`,
    playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
    },
};

interface YoutubePlayerTarget {
    pauseVideo: () => void,
    playVideo: () => void
}

const PlayerFooter = ({ spotifyAccessToken, currentSong, playNextSong, playPreviousSong }: { spotifyAccessToken: string, currentSong?: GenericTrack, playNextSong: () => void, playPreviousSong: () => void }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const [youtubePlayerTarget, setYoutubePlayerTarget] = useState<YoutubePlayerTarget | undefined>(undefined)

    useEffect(() => {
        if (!currentSong) return
        // song has changed
        setIsPlaying(true)
    }, [currentSong])

    const handlePlayButtonClicked = () => {
        if (!currentSong) return
        if (currentSong.platform == 1) { // TODO - do not use numbers!
            if (isPlaying) {
                youtubePlayerTarget?.pauseVideo()
            } else {
                youtubePlayerTarget?.playVideo()
            }
        }
        setIsPlaying(!isPlaying)
    }

    if (!currentSong) {
        return null
    }

    return (
        <HStack position="fixed" w="100%" bottom="0"
            p="2"
            bg={useColorModeValue('white', 'gray.900')}
            borderTop="1px"
            borderTopColor={useColorModeValue('gray.200', 'gray.700')}
            minH="5.5em"
        >
            {currentSong.platform.valueOf() == 1 ? ( // TODO - do not use numbers!
                <YouTube
                    videoId={currentSong.platformSpecificId}
                    opts={YOUTUBE_PLAYER_OPTS}
                    onReady={(e) => {
                        setYoutubePlayerTarget(e.target);
                    }}
                // onStateChange={handleYoutubePlayerStateChange}
                />
            ) : null}

            {currentSong.platform.valueOf() == 0 ? ( // TODO - do not use numbers!
                <div style={{ display: "none" }}>
                    <SpotifyPlayer
                        token={spotifyAccessToken}
                        uris={[`spotify:track:${currentSong.platformSpecificId}`]}
                        autoPlay={true}
                        play={isPlaying}
                    // callback={handleSpotifyPlayerCallback}
                    />
                </div>
            ) : null}


            <HStack>
                <Image src={currentSong.coverArtImageUrl ?? DEFAULT_COVER_ART_IMAGE} w="4em" borderRadius="lg" />
                <VStack alignItems="start">
                    <Text fontWeight="bold" noOfLines={1}>{currentSong.title}</Text>
                    <Text color="gray.400" noOfLines={1}>{currentSong.artists.join(", ")}</Text>
                </VStack>
            </HStack>
            <HStack position="absolute" justifyContent="center" w="100%">
                <IconButton
                    variant="ghost"
                    aria-label="previous song"
                    onClick={playPreviousSong}
                    icon={<FaStepBackward />}
                />
                <IconButton
                    variant="ghost"
                    aria-label="pause song"
                    onClick={handlePlayButtonClicked}
                    icon={isPlaying ? <FaPause /> : <FaPlay />}
                />
                <IconButton
                    variant="ghost"
                    aria-label="next song"
                    onClick={playNextSong}
                    icon={<FaStepForward />}
                />
            </HStack>
        </HStack>
    )
}

export default PlayerFooter