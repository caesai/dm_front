import image from '@/components/Stories/renderers/Image.tsx';
import video from '@/components/Stories/renderers/Video.tsx';
import autoplayContent from '@/components/Stories/renderers/AutoPlayContent.tsx';
import defaultRenderer from '@/components/Stories/renderers/Default.tsx';
import customRenderer from '@/components/Stories/renderers/Custom.tsx';

export const renderers = [image, video, autoplayContent, customRenderer, defaultRenderer];
