
let urlBase = "https://sorteio-curso-canal-default-rtdb.firebaseio.com/users/";

let isProd = window.location.hostname === "carlos-alexandre-leutz.github.io";
if(!isProd) {
isProd = window.location.hostname === "alexandreleutz.com.br";
}
if (isProd) {
    urlBase ="https://pagina-de-venda-dap-default-rtdb.firebaseio.com/18-01-25/"; //dados salvos a partir desta data
};

export default urlBase;