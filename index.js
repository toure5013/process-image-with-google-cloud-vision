require('dotenv').config();

const request = require("request")
const request_promise = require('request-promise-native').defaults({
    encoding: 'base64'
})




const test = false
var user_file = ""
var fileStringified = "";
const OCR_KEY = process.env.OCR_KEY

/**
 *
 * @param {*} img_url : String
 * @param {*} _algorithme_type : [String, String , String]
 */

async function imageProcessing(img_url, convert_image=false)  {
    const data = convert_image ? await request_promise(img_url) : img_url
    try {

        var options = {
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
                        languageHints: ['en-t-i0-handwrit'],
                    },
                }, ],
            }),
        }


        request(options, function (error, response) {
            if (error) {
                //Une erreur est survenue
                console.log('OCR error')
                console.log(error)
                return
            }

            console.log(response.body)

            if (response.statusCode == 200) {
                //console.log(response.body)
                let body = JSON.parse(response.body)
                console.log(body);
                // let userCardText = body.responses[0]

            } else {
                console.log({
                    "text": `Oups, il semble que nous n'avons pas été capable de dectecter les informations de votre carte. Veuillez fourni une autre capture de la face arrière s'il vous plait (3).`
                })

            }
        })

    } catch (e) {
        console.log(e)
        console.log({
            //"text": `une erreur s'est produite, veuillez réessayer s'il vous plait !`
            "text": `Oups, il semble que nous n'avons pas été capable de dectecter les informations de votre carte. Veuillez fourni une autre capture de la face arrière s'il vous plait (3). ${img_url}`

        })
    }
}

/* --------------------------------- ------------------ ------------------ ------------------ ---

--------------------------------- ------------------ ------------------ ------------------ --- */

var _img_url = "https://i.ibb.co/tYNpZGx/Capture-d-e-cran-2023-09-20-a-13-10-30.png";
imageProcessing(_img_url, true)