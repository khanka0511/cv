interface HTTPRequest {
  headers?: { [key: string]: string };

  url: string;
  method: string;

  body?: any;
  urlEncodeBody?: boolean;

  parseJSON?: boolean;
}

function $http<T>(requestData: HTTPRequest): Promise<T> {
  let request = new XMLHttpRequest();
  request.open(requestData.method, requestData.url, true);

  if (requestData.headers)
    for (let header in requestData.headers) request.setRequestHeader(header, requestData.headers[header]);

  if (requestData.method === 'GET') request.send();
  else {
    if (!requestData.urlEncodeBody) request.send(JSON.stringify(requestData.body));
    else {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      let requestString = '';
      for (let key in requestData.body)
        requestString += encodeURIComponent(key) + '=' + encodeURIComponent(requestData.body[key]) + '&';
      request.send(requestString.slice(0, -1));
    }
  }

  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status !== 200) reject(request.statusText);
        else if (requestData.parseJSON) resolve(JSON.parse(request.responseText) as T);
        else resolve(request.responseText as any);
      }
    };
  });
}
