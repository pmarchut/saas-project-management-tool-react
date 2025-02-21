// this component will be used in instead of an img element.
import { TwicImg } from "@twicpics/components/react";
import { useMemo } from "react";

interface AppImageProps {
    src: string;
    className?: string;
}

function AppImage({ src, className }: AppImageProps) {
    function toTwicpicsUrl(url: string) {
        return url.replace("https://cdn.filestackcontent.com/", "");
    }

    const twicpicsUrl = useMemo(() => toTwicpicsUrl(src), [src]);

    return (
        <TwicImg className={className} src={twicpicsUrl} ratio="none" />
    )
}
  
export default AppImage