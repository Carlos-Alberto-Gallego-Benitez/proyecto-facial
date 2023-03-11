/*
* Autor: Carlos Alberto Gallego Benitez
* Perfil: Desarrollador de Software
* Efoque: Python IA, reconocimiento facial
* Tel: 3235957832
*
* */

//para bloquear la opción de click derecho del mouse
//document.addEventListener('contextmenu', event => event.preventDefault());

let nombreLog = "";
var setintv = null;
var video = null;

$(document).ready(() => {
    alerta();
})

function alerta() {
    swal({
        title: "Bienvenido al sistema de Logeo, Ingresa tu nombre ",
        content: "input",
    }).then((value) => {
        if (value == null) {
            alerta();
            return;
        }
        if (value != null) {
            nombreLog = value;
            ventana();
        }
        swal(`Señor@ ${nombreLog} recuerde tener una buena iluminación y un contraste adecuado,  a la hora del logeo`);
    });
}

function ventana() {
    new WinBox("Login", {

        mount: document.getElementById("contendor"),
        width: 479,
        height: 410,
    });
    video = document.getElementById("video")
    iniciarVideo();
}

onkeydown = e => {
    let tecla = e.which || e.keyCode;

    // Evaluar si se ha presionado la tecla Ctrl:
    if (e.ctrlKey) {
        // Evitar el comportamiento por defecto del nevagador:
        e.preventDefault();
        e.stopPropagation();
        console.log(tecla);
        // Mostrar el resultado de la combinación de las teclas:
        if (tecla === 85)
            alert("Ha presionado las teclas Ctrl + U");

        if (tecla === 83)
            alert("Ha presionado las teclas Ctrl + S");
    }
}



//para solicitar el dispositivo de multimdia de entrada de video
// se sobre escribe según el navegador que se utilice
function inicioVideo() {
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia)
    navigator.getUserMedia(
        {video: {}},//indicamos de donde vamos a sacar la info del dispositivo de entrada
        stream => video.srcObject = stream,//obtenemos el stream del video capturado y se lo pasamos al srcobject de la etiqueta video
        err => swal(err)//obtenemos el  error por si algo falla en el procedimeinto
    ) //recuperamos la info de camara web según el dispositivo entrada
    $("#imLoad").hide();
}

//cargamos los modelos de faceapi
function iniciarVideo() {
    $("#imLoad").show();
    Promise.all([

        faceapi.nets.tinyFaceDetector.loadFromUri("../static/face_api/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("../static/face_api/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("../static/face_api/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("../static/face_api/models"),
        faceapi.nets.ageGenderNet.loadFromUri("../static/face_api/models")

    ]).then(inicioVideo)

//capturamos el evento play del  video para saber cuando inció el video y generar nuestro canvas con los modelos de face api
    video.addEventListener("play", async () => {
        let canvas = faceapi.createCanvasFromMedia(video) //para obtener el canvas de face api con el video ya obtenido de la webcam
        canvas.setAttribute("id", "canvas1")
        $("#camaraweb").append(canvas);
        let displaySize = {width: video.width, height: video.height};
        1 //objeto para manipular el tamaño de los modelos de face api, dentro de nuestro canvas
        faceapi.matchDimensions(canvas, displaySize) //tomamos las detencciones e ir ajustandolas a nuestro canvas
        //ejecutamos el intervalo de peticiones para marcar los modelos en nuestro canvas
        $("#imLoad").hide();
        var i = 0;
        setintv = setInterval(async () => {
            const detecciones = await faceapi.detectAllFaces(video, new
            faceapi.TinyFaceDetectorOptions()).withFaceExpressions();//obtenemos las detecciones para luego mostraralas en el canvas
            const resizeDetections = faceapi.resizeResults(detecciones, displaySize); //para indicar que las detecciones sean iguales al canvas

            canvas.getContext('2d').clearRect(0, 0, canvas.height, canvas.width) //limpiamos el canvas para que las detenciones no se nos queden siempre en la pantalla
            faceapi.draw.drawDetections(canvas, resizeDetections)//pintamos las detecciones obtenidas anteriormente, en el canvas
            faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
            //console.log(detecciones[0]);

            //cuando la detección sea la adecuada se toma la captura y se procesa en el servidor
            if (detecciones[0] !== undefined) {
                i--;
                if (detecciones[0].detection._score >= 0.98) {
                    tomarFoto();
                }
            }else{
                i++;
                console.log(i);
            }
            if(i == 120){
                clearInterval(setintv);
                $(".wb-close").click();
                swal({
                    icon: "warning",
                    title: "El sistema no ha detectado un rostro humano"
                });
            }
        }, 200);
    })
}

function obtenerCap() {//tomamos la foto y la enviamos a un canvas para luego obtener el valor
    var canvas = document.getElementById('canvas')
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, 640, 480);
    $("#winbox-1").hide();
    $("#video").hide();
    $("#canvas1").remove();
}

function tomarFoto() {
    obtenerCap();
    //obtenemos el canvas donde esta la imagen
    var canvas = document.getElementById('canvas')

    let imagen = canvas.toDataURL(); //obtenemos la imagen codificada por base64
    imagen = imagen.split(","); //limpiamos para sacar solo la codifición
    imagen = imagen[1];
    //enviamos los valores al servidor para ser procesados
    $.ajax({
        url: "validar_imagen",
        type: "POST",
        data: {
            imagen: imagen,
            nombre: nombreLog
        },
        success: (data) => {
            if (data == "exito") {
                swal({
                    icon: "success",
                    title: "Logeado correctamente"
                });
                clearInterval(setintv);
                location.reload();
                $("#winbox-1").hide();
                $("#video").hide();
                $("#canvas1").remove();

            }
            if (data == "error") {
                swal({
                    icon: "error",
                    title: "Error de compatibilidad"
                });
                clearInterval(setintv);
                location.reload();
            }
        },
        error: (data) => {
            swal('Ocurrió un error en el servidor');
        }
    });

}

/* con este tomamos la foto
* video.addEventListener("play", () => {
    let canvas = faceapi.createCanvasFromMedia(video) //para obtener el canvas de face api con el video ya obtenido de la webcam
    $("#camaraweb").html(canvas);
})
*
* */