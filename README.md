# simple-ci-system

Простая система continious integration

## Содержание

1. [Установка](#установка)
2. [Запуск](#запуск)
3. [Краткий обзор работы с приложением](#краткий-обзор-работы-с-приложением)
3. [Используемые пакеты](#используемые-пакеты)
4. [Файлы конфигураций](#файлы-конфигураций)
5. [Интересные моменты](#интересные-моменты)
6. [Логика работы приложения](#логика-работы-приложения)
7. [Возникшие проблемы](#возникшие-проблемы)

## Установка

1. `git clone https://github.com/vlad8zavr/simple-ci-system.git`
2. `cd ./simple-ci-system`
3. `cd ./server`
4. `npm i`
5. `cd ../agent`
6. `npm i`
7. `cd ../`

## Запуск

**Сервер**

0. Прописать в файле конфига `./server/config.json` путь до репозитория
1. `cd ./server/`
2. `npm start`
3. Открыть в браузере страницу **`http://localhost:8800`**

( или `node ./server/server.js` )

**Агент**

1. `cd ./agent/`
2. `npm start`

( или `node ./agent/agent.js` )


## Краткий обзор работы с приложением

1. При открытии страницы **`http://localhost:8800`** появится экран следующего вида

`(/screenshots/ci-app-1.png)`

![page-1](/screenshots/ci-app-1.png)

В первом инпуте вводится хэш коммита, во втором - команда сборки.

При завершении агентом процесса сборки и получением сервером информации, внизу в блоке **Сборки** появится информация о текущей сборке: id сборки и статус.

2. При клике на id сборки в новом окне откроется страница с подробной информацией об этой сборке.

`(/screenshots/ci-app-2.png)`

![page-1](/screenshots/ci-app-2.png)

## Используемые пакеты

1. express
2. bodyParser
3. path
4. request
5. os
6. child_process

## Файлы конфигураций

В каждом из двух папок - `./agent/` и `./server/` хранятся файлы конфигураций `config.json` для агента и сервера соответственно.

В конфиге сервера я прописал относительный путь до репозитория, а не абсолютный, потому что в моей среде (windows) в таком случае появляется ошибка.

## Интересные моменты

Выяснилось, что на операционных системах Windows нельзя просто так взять и вызвать `npm` через `spawn`. Для корректной работы в коде я заменяю `npm` на `npm.cmd`, если операционная система - windows.

(Источник: https://github.com/nodejs/node/issues/3675)

## Принимаемая информация

```javascript
// main page - info about builds
{
    buildReview: {
        buildCode: BUILDCODE, 
        code: req.body.code
    }
}

// main page - no free agents
{
    agentFilled: true
}

// page build
{
    buildInfo {
        timeStart: timeStart,
        timeEnd: timeEnd,
        code: code,
        result: result
    }
}
```

## Логика работы приложения

Приложение состоит из 2-х больших блоков: `server` и `agent`.

**Server**

* Рендерит html на странице `http://localhost:8800`.

* Принимает запрос о регистрации агента по ручке `/notify_agent`.

* Принимает запрос от пользователя (html форма) о сборке по ручке `/build_request`.

* Отправляет агенту запрос и данные для сборки на ручку агента `/build`.

* Принимает от агента информацию о сборке по ручке `/notify_build_result`.

* Создает новую html страницу с результатами сборки. Название html документа - уникальный id сборки.

* Рендерит html с результатами сборки по ручке `/build/:id`.


**Agent**

* Отправляет запрос на регистрацию у сервера, передавая при этом свой хост и порт.

* Принимает от сервера запрос на сборку по ручке `/build`.

* Выполняет сборку в указанном репозитории, на указанном коммите переданной командой.

* Отправляет результаты сборки на сервер на ручку сервера `/notify_build_result`.


## Возникшие проблемы

В ходе выполнения задания я натолкнулся на проблему, которую пока не смог решить.

При первом выполнении процесса сборки и отправке данных от агента на сервер - все нормально.
Но при следующей отправки данных от агента на нем возникает ошибка `Can't set headers after they are sent`.

**UPDATE**

Мне удалось устранить данную проблему, но теперь каждый запрос с html формы начиная со второго не завершается. 
Пока пытаюсь разрешить данную ситуацию.

Между тем новые html документы создаются и их можно открыть в браузере по адресам

**`http://localhost:8800/build/10001`**
**`http://localhost:8800/build/10002`**
**`http://localhost:8800/build/10003`**

и так далее.

Также я увидел, что если отправлять с сервера на html страницу ответ в виде:

```javascript
resClient.json({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code }});
resClient.end();
```

то будет ошибка с заголовками `Can't set headers after they are sent`.

Если же написать 

```javascript
resClient.end(JSON.stringify({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code }}));
```

то ошибок уже не будет, но ответы начиная со второго запроса приходить уже не будут.

Также была мысль, что ошибка в использовании метода `fetch` на странице html.

**NEW UPDATE**

Вот что еще заметил.

На сервере прием пост запроса от html формы по ручке `/build_request`.

При такой структуре обработки - сервер каждый раз отвечает

```javascript
app.post('/build_request', (reqClient, resClient) => {

    BUILDCODE++;
    resClient.json({ buildReview: { buildCode: BUILDCODE, code: 0 }});

});
```

Но если логика более сложная и во время обработки соверщается пост запрос на агента, а затем получение от него данных по ручке `/notify_build_result`, наконец отправка полученных данных на страницу `resClient.end(JSON.stringify({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code }}));`, в таком случае ответы начиная со 2-го либо не приходят (`res.end`), либо происходит ошибка (`res.json`)

```javascript
app.post('/build_request', (reqClient, resClient) => {

    for (let i = 0, length = agentList.length; i < length; i++) {
        if (agentList[i].isFree === true) {
            agentList[i].isFree = false;

            let agent = agentList[i];
            const url = `http://${agent.host}:${agent.port}/build`;
            const json = { repo: REPO, hash: reqClient.body.hash, command: reqClient.body.command };

            // отправка post запроса на агента
            sendPostRequest(url, json);

            // получение post запроса от агента
            app.post('/notify_build_result', (reqAgent, resAgent) => {
        
                BUILDCODE++;
                releaseCurrentAgent(agent);
                createNewHTMLFile(reqAgent);
                
                resAgent.end('[SERVER] CLOSED POST /notufy_build_result');

                // отправка данных на html страницу
                resClient.end(JSON.stringify({ buildReview: { buildCode: BUILDCODE, code: reqAgent.body.code }}));
            })
            break;
        }
    }
});
```

## Links

https://www.endyourif.com/cant-set-headers-after-they-are-sent/

