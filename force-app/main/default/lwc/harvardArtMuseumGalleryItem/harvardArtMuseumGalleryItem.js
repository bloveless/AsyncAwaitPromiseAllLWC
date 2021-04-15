import { LightningElement, api } from 'lwc';

export default class HarvardArtMuseumGalleryItem extends LightningElement {
    @api
    record;

    get hasImage() {
        return this.record.images && this.record.images.length > 0 && this.record.images[0].baseimageurl;
    }

    get image() {
        if (this.record.images && this.record.images.length > 0) {
            return this.record.images[0].baseimageurl;
        }

        return "";
    }

    get title() {
        return this.record.title;
    }

    get backgroundStyle() {
        return `background-image:url('${this.image}');`
    }
}
