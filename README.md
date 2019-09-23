# Пример реализации SpeechKit Yandex(запись с микрофона)
* Запись реализован с помощью языка `JavaScript` и `WebAudioRecorder` <br>
* Запись отсылаю по `API` с помощью `PHP`

 ## Установка
Клонируйте репозиторий и откройте `speech.html`

 ## Использование
 * Измените `$apiKey` в `speech.php`
 * Нажмите на кнопку записи с микрофона
 * Разрешите запись с микрофона
 * По завершению нажмите на `распознать`
 
 ## Детали
 * Записывается голос с микрофона с помощью [WebAudioRecorder](https://github.com/addpipe/simple-web-audio-recorder-demo)
 * По нажатию на кнопку записи вызывается функция `startRecording` и открывается модальное окно
 * По нажатию на кнопку остановки вызывается функция `stopRecording` 
 * По завершении записи вызывается функция `createDownloadLink`
 * Запись преобразуем в `blob`
 * `blob` преобразуем в `base64` с помощью `FileReader`
 * `base64` передаем с помощью `POST` к `php`
 *  в php создаем файл из `base64` с помощью
 ```php
    file_put_contents($audioFileName, base64_decode($file));
```
* Сохраняем файл на сервере
* Открываем файл созданный только что и передаем к `Speechkit` и когда ответ получен, удаляем файл и возвращаем JSON
```php
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
```