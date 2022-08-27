function verLogin() {
    $.ajax({
       url: "http://localhost:2345/login_gym",
       type: "POST"
    });
}


function cerrarSession() {
    $.ajax({
        url: "cerrar_session",
        type: "POST",
        success: (data) => {
            debugger;
            if(data == "Ok") {
                swal({
                    icon: "success",
                    title: "Sesión cerrada correctamente"
                });
                location.reload();
            }
        },
        error: (data) => {
            swal('Ocurrió un error en el servidor');
        }
    });
}
function registrarUsuario(){
    
}
