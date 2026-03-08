interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  // Support YouTube, Vimeo, or direct video URLs
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match?.[1];
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match?.[1];
  };

  if (isYoutube) {
    const videoId = getYoutubeId(url);
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title || 'Video lesson'}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeo) {
    const videoId = getVimeoId(url);
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title || 'Video lesson'}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video file
  return (
    <div className="w-full rounded-xl overflow-hidden bg-black">
      <video
        src={url}
        controls
        className="w-full"
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};