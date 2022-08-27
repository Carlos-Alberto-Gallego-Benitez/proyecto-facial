from flask import Flask, render_template, request, redirect, url_for,flash, session#para enviar mensajes
import base64
import cv2
import os
from cv2 import *


app = Flask(__name__)
app.secret_key = 'sessionMyGym'

path = 'C:/Users/Acer/PycharmProjects/facial/venv/capturas'
comparative = 'C:/Users/Acer/PycharmProjects/facial/venv/comparative'

@app.route("/")
def inicial():
    return render_template("inicio.html")

@app.route("/login_gym", methods=['GET'])
def login():
    print(request.args.get("action"))
    return render_template("login.html", action = request.args.get("action"))


#con esta funcion comprobamos la compatiblidad del usuario a logear
def compatibility(img1, img2):
    orb = cv2.ORB_create()

    kpa, dac1 = orb.detectAndCompute(img1, None)
    kpa, dac2 = orb.detectAndCompute(img2, None)

    comp = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    matches = comp.match(dac1, dac2)

    similar = [x for x in matches if x.distance < 70]
    if len(matches) == 0:
        return 0
    return len(similar)/len(matches)


#ruta inicial donde llegará la imagen del login y se validara el acceso
@app.route("/validar_imagen", methods = ['POST'])
def valiarImg():
    imagen = request.form['imagen']
    nombre = request.form['nombre']
    nombre = nombre.replace(" ", "")
    image_binary = base64.b64decode(imagen)
    with open(comparative + "/" + nombre + ".png", 'wb') as f:
        f.write(image_binary)

    face_reg = cv2.imread(path + "/"+ nombre +".png", 0)
    face_log = cv2.imread(comparative + "/" + nombre + ".png", 0)

    salida = compatibility(face_reg, face_log);
    if salida > 0.94 :
        session['usuario'] = nombre + "@email.com"
        salida = "exito"
    elif salida < 0.94:
        salida = "error"
    os.remove(comparative + "/" + nombre + ".png")
    return salida


@app.route("/cerrar_session", methods = ['POST'])
def cerrarSession():
    session.clear()
    return "Ok"


if(__name__ == "__main__"):
    app.run(host="localhost", port=2345, debug=True)




