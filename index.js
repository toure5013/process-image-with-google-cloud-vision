const request = require("request")
const request_promise = require('request-promise-native').defaults({
    encoding: 'base64'
})

require('dotenv').config();
const OCR_KEY = process.env.OCR_KEY

/**
 *
 * @param {*} img_url : String
 * @param {*} _algorithme_type : [String, String , String]
 */

async function imageProcessing(img_url, convert_image = false, logbody=false) {

    var options = {
        method: 'POST',
        url: `https://vision.googleapis.com/v1/images:annotate?key=${OCR_KEY}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [{
                image: {
                    source: {
                        imageUri: img_url,
                    },
                },
                features: [{
                    type: 'FACE_DETECTION',
                },],
                imageContext: {
                    languageHints: ['en-t-i0-handwrit'],
                },
            },],
        }),
    };

    if(convert_image){
        const data = convert_image ? await request_promise(img_url) : img_url
        options = {
            method: 'POST',
            url: `https://vision.googleapis.com/v1/images:annotate?key=${OCR_KEY}`,
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                requests: [{
                        image: convert_image ? {content: data } : {source: {imageUri: img_url,content: data},
                    },
                    features: [{
                            "maxResults": 50,
                            "type": "FACE_DETECTION"
                        },

                    ],
                    imageContext: {
                        // languageHints: ['en-t-i0-handwrit'],
                    },
                }, ],
            }),
        }

    }

    try {
        request(options, function (error, response) {
            if (error) {
                //Une erreur est survenue
                console.log('OCR error')
                console.log(error)
                return false;
            }

            if(logbody){
                console.log(response.body)
            }


            if (response.statusCode == 200) {
                //console.log(response.body)
                let body = JSON.parse(response.body)
                console.log(body);
                console.log(body.responses[0]?.faceAnnotations[0]?.detectionConfidence)
                if (body.responses[0]?.faceAnnotations[0]?.detectionConfidence > 0.6) {
                    console.log(`Face detected with ${body.responses[0]?.faceAnnotations[0]?.detectionConfidence} % of confidence. It's a human ! :👳`);
                    return true;
                }


            } else {
                console.log({
                    "text": `Oups! Une erreur est survenue. ${img_url}`
                })
                return false;
            }
        })

    } catch (e) {
        console.log(e)
        console.log({
            //"text": `une erreur s'est produite, veuillez réessayer s'il vous plait !`
            "text": `Oups! Une erreur est survenue. ${img_url}`

        })
        return false;
    }
}

/* --------------------------------- ------------------ ------------------ ------------------ ---

--------------------------------- ------------------ ------------------ ------------------ --- */

//Exemple with cdn - url
var _img_url = "https://cdn-2.messaging.cm.com/fileproxy/files/938181979b6a486dae0d5a52fb2a299f";
imageProcessing(_img_url, false) // Without convertion work fine on cdn image


//Exemple with others
var _img_url1 = "https://i.ibb.co/tYNpZGx/Capture-d-e-cran-2023-09-20-a-13-10-30.png";
imageProcessing(_img_url1, true) // Without convertion work fine on cdn image
