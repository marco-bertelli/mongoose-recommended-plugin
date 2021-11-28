try {
  var mongoose = require('mongoose');
} catch (_) {
  // workaround when `npm link`'ed for development
  var prequire = require('parent-require')
    , mongoose = prequire('mongoose');
}

const { formatData, createVectorsFromDocs, calcSimilarities } = require('./algoritm');
const _ = require('lodash');

let relatedSchema;
let relatedModel;

function initializeRelatedModel(collectionName){
  relatedSchema = new mongoose.Schema({ entityId: { type: String }, relatedScore: [{}] });
  relatedModel = mongoose.model(`${collectionName}SimilarResults`, relatedSchema);
}

async function saveSimilarScores(collectionName, field, minSimilarity){

  let Model = null;

  _.map(mongoose.models,(model)=>{
   if (model.collection.collectionName === collectionName) Model = model ;
  });

  let data = await Model.find();

  let formatted = formatData(data,field);

  let docsVector = createVectorsFromDocs(formatted);

  let scoredResults = calcSimilarities(docsVector,minSimilarity);

  // cancello i risultati passati ormai non più validi
  await relatedModel.deleteMany();

  // trasformo ad array per salvare
  scoredResults = Object.keys(scoredResults).map(key => ({ key, value: scoredResults[key] }));

  await Promise.map(scoredResults,(result)=>{

    if (_.isEmpty(result.value)) return;


    return relatedModel.create({ entityId: result.key, relatedScore: result.value });
  });

}

module.exports.default = function RecommendedPlugin(schema) {

  // trasformazione da oggetto ad array di oggetti
  const arr = Object.keys(schema.obj).map(key => ({ key, value: schema.obj[key] }));
  const fieldToSimilar = _.find(arr, function(path) { return path.value.similar === true; });

  if (_.isNil(fieldToSimilar)) {
    return;
  }

  const fieldNameToSimilar = fieldToSimilar.key;
  const minSimilarity = fieldToSimilar.value.minSimilarity || 0.2;

  initializeRelatedModel(schema.options.collection);

  schema.statics.getSimilar = async function (entityId){
    return await contentBasedRaccomandEngine(entityId);
  };

  schema.statics.calculateSimilars = async function (){
    return await saveSimilarScores(schema.options.collection,fieldNameToSimilar, minSimilarity);
  };

}

module.exports.contentBasedRaccomandEngine = async function contentBasedRaccomandEngine(entityId){

    return await relatedModel.find({ entityId: entityId });

}

