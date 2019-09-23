<?php

 function SpeechKit($audioFileName){
    try {
        $apiKey="";
        $file = fopen($audioFileName, 'rb');
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize");

        curl_setopt($ch,CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Authorization: Api-Key ".$apiKey,
            "Transfer-Encoding: chunked",
            "Content-Type: audio/x-pcm;",
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
        sleep (1);
        curl_setopt($ch, CURLOPT_INFILE, $file);
        curl_setopt($ch, CURLOPT_INFILESIZE, filesize($audioFileName));
        $res = curl_exec($ch);
        curl_close($ch);
    } catch (\ Exception $e) {
        echo "{\"answer\":{\"result\":\"\",\"error\":\"error\"}}";
    }
    $decodedResponse = json_decode($res, true);
    if (isset($decodedResponse["result"])) {
        echo "{\"answer\":{\"result\":\"".$decodedResponse["result"]."\",\"error\":\"\"}}";
    } else {
        echo "{\"answer\":{\"result\":\"\",\"error\":\"error ".$decodedResponse["error_message"]."\"}}";
    }
     fclose($file);
    if (file_exists($audioFileName)) {
        //echo "<br>"."Delete"."<br>";
        unlink($audioFileName);
    }

}

try {
     if ($_POST['action']){
         //echo "Begin3"."<br>";
         $audioFileName=rand(10000,50000).'_search.ogg';
         //$audioFileName='speech.ogg';
         $file=str_replace("\n","+",str_replace(" ","+",$_POST['action']));
         file_put_contents($audioFileName, base64_decode($file));
         SpeechKit($audioFileName);
         //echo "File put"."<br>";
     }else{
         echo "{\"answer\":{\"result\":\"\",\"error\":\"error\"}}";
     }
} catch (\ Exception $e) {
    echo "{\"answer\":{\"result\":\"\",\"error\":\"error\"}}";
}
//echo "END"."<br>";
