export interface GalleryPhoto {
    link: string;
}

export interface GalleryCollection {
    title: string;
    photos: GalleryPhoto[];
}

export interface IMenuItem {
    title: string;
    photo: string;
    price: number;
}
