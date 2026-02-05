'use strict';

const purchase = [
  { name: 'Laptop',  price: 1500 },
  { name: 'Mouse',  price: 25 },
  { name: 'Keyboard',  price: 100 },
  { name: 'HDMI cable',  price: 10 },
  { name: 'Bag', price: 50 },
  { name: 'Mouse pad', price: 5 },
];

class PurchaseIterator {
  #items;

  constructor(items) {
    this.#items = items;
  }

  static create(items) {
    return new PurchaseIterator(items);
  }

  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < this.#items.length; i++) {
      await Promise.resolve();
      yield this.#items[i];
    }
  }
}

class Basket {
  #limit;
  #items = [];
  #total = 0;
  #errors = [];
  #onChange;
  #pending = [];

  constructor({ limit }, onChange = async () => {}) {
    this.#limit = limit;
    this.#onChange = onChange;
  }

  add(item) {
    const nextTotal = this.#total + item.price;

    if (nextTotal > this.#limit) {
      this.#errors.push(
        new Error(`Limit exceeded by "${item.name}" (${item.price})`)
      );
      return false;
    }

    this.#items.push(item);
    this.#total = nextTotal;

    this.#pending.push(this.#notify());
    return true;
  }

  end() {
    return Promise.all(this.#pending).then(() => ({
      items: [...this.#items],
      total: this.#total,
      errors: this.#errors.map((error) => error.message),
    }));
  }



  async #notify() {
    try {
      await this.#onChange([...this.#items], this.#total);
    } catch (error) {
      this.#errors.push(error);
    }
  }
}

const main = async () => {
  const goods = PurchaseIterator.create(purchase);
  const basket = new Basket({ limit: 1050 }, (items, total) => {
    console.log(total);
  });

  for await (const item of goods) {
    basket.add(item);
  }
  
  basket.end().then(({ items, total, errors }) => {
    console.log('Items:', items.map((item) => item.name));
    console.log('Total:', total);
    console.log('Errors:', errors);
  });
};

main();
