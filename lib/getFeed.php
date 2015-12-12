<?php

/** Perform a GET request and echo the response **/
$id = $_GET['id'];
$type = $_GET['type'];
$url = 'http://horoscope-api.herokuapp.com/horoscope/' . $type . '/'.$id;

$ch = curl_init();
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch,CURLOPT_CONNECTTIMEOUT, 4);
$json = curl_exec($ch);
if(!$json) {
    echo curl_error($ch);
}
curl_close($ch);

$response = json_encode($json);

echo $response;
