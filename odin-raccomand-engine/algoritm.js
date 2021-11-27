const TfIdf = require('node-tfidf');
const Vector = require('vector-object');

const formatData = (data, field) => {
    let formatted = [];

    formatted = data.map((data)=>{
        return { id: data._id,content: data[field].replace(/[^\w\s]/gi, '').toLowerCase() };
    });

    return formatted;
  };

const createVectorsFromDocs = processedDocs => {
    const tfidf = new TfIdf();

    processedDocs.forEach(processedDocument => {
      tfidf.addDocument(processedDocument.content);
    });

    const documentVectors = [];

    for (let i = 0; i < processedDocs.length; i += 1) {
      const processedDocument = processedDocs[i];
      const obj = {};

      const items = tfidf.listTerms(i);

      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];
        obj[item.term] = item.tfidf;
      }

      const documentVector = {
        id: processedDocument.id,
        vector: new Vector(obj)
      };

      documentVectors.push(documentVector);
    }
    return documentVectors;
};

const calcSimilarities = (docVectors, minSimilarity) => {
    // numero massimo si oggetti correlati.
    const MAX_SIMILAR = 20;
    // min score preso dal campo!
    const MIN_SCORE = minSimilarity;

    const data = {};

    for (let i = 0; i < docVectors.length; i += 1) {
      const documentVector = docVectors[i];
      const { id } = documentVector;

      data[id] = [];
    }

    for (let i = 0; i < docVectors.length; i += 1) {
      for (let j = 0; j < i; j += 1) {
        const idi = docVectors[i].id;
        const vi = docVectors[i].vector;
        const idj = docVectors[j].id;
        const vj = docVectors[j].vector;
        const similarity = vi.getCosineSimilarity(vj);

        if (similarity > MIN_SCORE) {
          data[idi].push({ id: idj, score: similarity });
          data[idj].push({ id: idi, score: similarity });
        }
      }
    }

    // finally sort the similar documents by descending order
    Object.keys(data).forEach(id => {
      data[id].sort((a, b) => b.score - a.score);

      if (data[id].length > MAX_SIMILAR) {
        data[id] = data[id].slice(0, MAX_SIMILAR);
      }
    });

    return data;
};

module.exports = {formatData,createVectorsFromDocs,calcSimilarities}
