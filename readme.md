# mongoose-recommended-plugin

**install**

```
npm install mongoose-recommended-plugin

```

**what is this library about?**
the scope of this library is allow mongoose users to implement in a simple way a content-based recommended system with mongoose schema,
is pretty simple and in future i want to introduce a collaborative-filter method.

**how work**
calculate similarities between mongoose entities on a single text field using tfidf and vector distance, for more search content-based systems descriptions

**how to use this library**
after install in your project add the plugin in entity schema in wich you want similar entities:

```
import { RecommendedPlugin } from 'mongoose-recommended-plugin';

const mongooseSchema = {

    YOUR SCHEMA DEFINITION
    
    };


    // before generating the model 
    mongooseSchema.plugin(RecommendedPlugin);

```

after add the plugin to schema you can put in schema types two new field:
- similar = indicate the text field to calculate similarity like name or description
- minSimilarity = indicate the min percentage to mark another entity similar (es 0.1 is 10%)

an example:

```
{
        offerCode: {
            type: String,
            odinQFilter: true
        },
        discountCode: {
            type: String,
        },
        // make sure flace similar on a String field!
        discountDescription: {
            type: String,
            odinQFilter: true,
            similar: true,
            minSimilarity: 0.1
        },
        originalPrice: {
            type: Number
        },
        discountedPrice: {
            type: Number
        },
        discountPercentage: {
            type: Number
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        neverExpire: {
            type: Boolean,
            default: false
        },
        offerLink: {
            type: String
        },
}

```

after this on the basic schema you have 2 new methods that allow you to calculate similars and get it:
- calculateSimilars
- getSimilar

**important** 
before calling getSimilar you have to call calculateSimilars to calculate and save in the db the similars.
we will see it now

now we have to call calculateSimilars to get and save into db the results (plugin will save results in a collection name: BASIC_COLLECTION_NAME+similarresults).

for using it i suggest using a schedulr like it: 

```
import schedule from 'node-schedule';
import Offers from '../../api/offers/model';

const log = logger.child({ section: '\x1B[0;35mScheduler:\x1B[0m' });

export const start = function () {
    log.info('Starting...');

    schedule.scheduleJob('*/10 * * * * *',calculateSimilarsResult);

    log.info('Starting...', 'DONE');
};

async function calculateSimilarsResult(){
    await Offers.calculateSimilars();
}

```

this is an example of how calculate similars every 10 seconds, ut you can call it when you want and how you want.

after this we can call seconds method passing the _id of entity for wich we want similars:

```

await Offers.getSimilar('619d2d91eac832002d2f36de')

```

and thats all!


**db format of plugin save**

```

{ 
    "_id" : ObjectId("61a25cae646804e510d84f92"), 
    "relatedScore" : [
        {
            "id" : ObjectId("619d2d91eac832002d2f36de"), 
            "score" : 0.45293266622972733
        }
    ], 
    "entityId" : "619ac77c39dd6b002d1bd3bb", 
    "__v" : NumberInt(0)
}

```

for questions or contribute write at marco.bertelli@runelab.it

