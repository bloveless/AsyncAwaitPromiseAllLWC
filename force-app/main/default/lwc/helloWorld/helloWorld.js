import { LightningElement } from 'lwc';

const BASE_URL = "https://api.harvardartmuseums.org/object?apikey=80ec0e2a-34c9-4aae-9030-1534ef8cc48f&size=20&hasimage=1&page=";

export default class HelloWorld extends LightningElement {
  greeting = 'World again';
  error;
  records;
  currentPage;
  pages = [];

  connectedCallback() {
    this.currentPage = 1;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setInterval(() => {
      this.changePage(this.currentPage);
      this.currentPage++;
    }, 5000);
  }

  async changePage(page) {
    let lowerBound = ((page - 3) < 0) ? 0 : page - 3;
    const upperBound = page + 3;

    const promises = [];
    for (let i = lowerBound; i <= upperBound; i++) {
      promises.push(this.getRecords(i));
    }

    await Promise.all(promises);

    // Now this.pages has all the data for the current page and the next/previous pages

    this.records = this.pages[page].records;

    console.log('current page response', this.pages[page]);
  }

  async getRecords(page) {
    if (page in this.pages) {
      return Promise.resolve(this.pages[page]);
    }

    return fetch(BASE_URL + page)
    .then((response) => {
      if (!response.ok) {
        this.error = response;
      }

      return response.json();
    }).then((responseJson) => {
      this.pages[page] = responseJson;
    }).catch((errorResponse) => {
      this.error = errorResponse;
    });
  }

  getBaseImageUrl(record) {
    return record.image[0].baseimageurl;
  }
}