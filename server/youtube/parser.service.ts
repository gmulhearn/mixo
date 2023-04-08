export interface YoutubeVideoMetadata {
    id: string,
    title: string,
    channelName: string,
    thumbnailImageUrl?: string
}

export const parseVideo = (data: any): YoutubeVideoMetadata | undefined => {

    const videoRenderer = data?.videoRenderer
    if (!videoRenderer) return undefined;

    try {

        let title = videoRenderer.title.runs[0].text;
        title = title.replace("\\\\", "\\");

        try {
            title = decodeURIComponent(title);
        } catch (e) {
            // @ts-ignore
        }

        const videoId = videoRenderer.videoId
        if (!videoId) {
            return undefined
        }
        const channelName = videoRenderer.longBylineText?.runs?.at(0)?.text
        if (!channelName) {
            return
        }

        const thumbnails = videoRenderer.thumbnail?.thumbnails

        return {
            id: videoId,
            title: title,
            channelName: channelName,
            thumbnailImageUrl: thumbnails.at(thumbnails?.length - 1)?.url
        };

    } catch (e) {
        return undefined
    }
}
