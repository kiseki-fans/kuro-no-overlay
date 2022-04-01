class TraversableArray extends Array {
  current = -1;
  next() {
    return this.current < this.length - 1
      ? this[++this.current]
      : this[this.current];
  }
  prev() {
    return this.current > 0 ? this[--this.current] : this[this.current];
  }
}

function mapTranslations(translations) {
  return {
    ...Object.fromEntries(
      Object.entries(translations).map(([chapter, trans]) => [
        chapter,
        new TraversableArray(...trans),
      ])
    ),
    date: translations.date,
  };
}

let chapters = mapTranslations(window.api.getTranslations());

async function updateTranslations() {
  return new Promise((resolve) => {
    window.api.updateTranslations((result) => {
      chapters = mapTranslations(result);
      chapters.date = new Date().toString();
      resolve();
    });
  });
}

export { chapters, updateTranslations };
