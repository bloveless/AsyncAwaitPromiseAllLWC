import { LightningElement, api } from "lwc";

const BASE_URL =
  "https://api.harvardartmuseums.org/object?apikey=$1&size=8&hasimage=1&page=$2";

export default class HarvardArtMuseumGallery extends LightningElement {
  @api harvardApiKey;

  error;
  records;
  currentPage = 1;
  pagesCache = [];

  chunkArray(array, size) {
    let result = [];
    for (let value of array) {
      let lastArray = result[result.length - 1];
      if (!lastArray || lastArray.length === size) {
        result.push([value]);
      } else {
        lastArray.push(value);
      }
    }

    return result.map((item, index) => ({ value: item, index: index }));
  }

  nextPage() {
    this.currentPage++;
    this.changePage(this.currentPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.changePage(this.currentPage);
    }
  }

  connectedCallback() {
    this.changePage(1);
  }

  async changePage(page) {
    let lowerBound = ((page - 3) < 0) ? 0 : page - 3;
    const upperBound = page + 3;

    // Cache the extra pages
    const promises = [];
    for (let i = lowerBound; i <= upperBound; i++) {
      promises.push(this.getRecords(i));
    }

    Promise.all(promises).then(() => console.log('finished cached pages'));

    // Now this.pages has all the data for the current page and the next/previous pages
    // The idea is that we will start the previous promises in order to prefrech the pages
    // and here we will wait for the current page to either be delivered from the cache or
    // the api call
    this.records = await this.getRecords(page);
  }

  async getRecords(page) {
    if (page in this.pagesCache) {
      return Promise.resolve(this.pagesCache[page]);
    }

    const url = BASE_URL.replace("$1", this.harvardApiKey).replace("$2", page);
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          this.error = response;
        }

        return response.json();
      })
      .then((responseJson) => {
        this.pagesCache[page] = this.chunkArray(responseJson.records, 4);
        return this.pagesCache[page];
      })
      .catch((errorResponse) => {
        this.error = errorResponse;
      });
  }
}
