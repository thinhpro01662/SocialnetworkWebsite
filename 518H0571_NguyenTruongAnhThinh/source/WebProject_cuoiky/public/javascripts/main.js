
function role(user) {
    if (user=="admin"){
        $("div.admin").show();
    }
       
    if (user=="manager"){
        $("div.manager").show();
    }

    if (user=="student"){
        $("div.student").show();
    }
}

function ShowCmt (){
    $("div.cmt").show();
}

function CloseCmt (){
    $("div.cmt").hide();
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setEmail() {
    var x = getParameterByName("useremail69");
    document.getElementById("useremail69").value =x;
}

function uploadavt(){
    $(".custom-file-input").on("change", function () {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
        console.log('ok')
    });


    $(document).ready(() => {
        $('#uploadButton').click(() => {
            let uploadFile = document.getElementById('attachment');
            let user = document.getElementById('useremail').value;
            if (uploadFile.files.length === 0){
                return alert("Vui lòng chọn ảnh")
            }
            let file = uploadFile.files[0];
            let form = new FormData();
            form.set('email', user);
            form.set('path', '/avt');
            form.set('attachment', file);
            let xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://poor-app-518-h-0571.herokuapp.com/upload', true)
            xhr.addEventListener('load', e => {
                if (xhr.readyState === 4 && xhr.status === 200){
                    const json = JSON.parse(xhr.responseText)
                }
            });
            xhr.upload.addEventListener('progress', e => {
            })
            xhr.send(form);
        })
    })
}

