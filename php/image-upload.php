<?php

if(isset($_FILES['image'])){
 echo    uploadFile('image');  
}

function uploadFile($name){

    $target_dir = __DIR__. "/images/";
    $target_file = $target_dir . basename($_FILES[$name]["name"]);
    $imageUrl = '';
    $feedback  = [];

    if(!file_exists($target_file)){
        if (move_uploaded_file($_FILES[$name]["tmp_name"], $target_file)) {
            $name =  basename($_FILES[$name]["name"]);
            $imageUrl = (isset($_SERVER['HTTPS'])  ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
             $imageUrl .='/php/images/'.$name;
             $feedback['imageUrl']=$imageUrl;
             $feedback['name']=pathinfo($target_file, PATHINFO_FILENAME);
        } else {
            $feedback['error']='Sorry, there was an error while uploading your image.';
        }
    }else{
        $feedback['error']=$_FILES[$name]["name"].' already exists';
    }
    
    return json_encode( $feedback) ;

}