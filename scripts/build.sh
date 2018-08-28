#!/usr/bin/env bash
if [ -d build/ ];
then
    rm -rf build || exit 1
fi
mkdir build 2>/dev/null
mkdir build/components 2>/dev/null
prettier --write "src/**/*.ts"
tsc || exit 1
if [ "$1" == "dev" ]
then
    cat << EOF > build/app.js
console.info('This app is built with development server. To compile app in builduction mode use "kach build --build" command.');
var es = new EventSource("/sse");
es.onmessage = () => {
    console.log("Update detected. Reloading...");
    location.reload();
};
$(cat build/app.js)
EOF
fi
uglifyjs build/app.js -o build/app.js
cp src/index.html build/
cp src/components/**/*.html build/components/
cp -r src/assets build/
sass src/components/app-root/app-root.sass build/styles.css --no-source-map || exit 1
if [ -d prod/ ];
then
    rm -rf prod/ || exit 1
fi
mv build/ prod || exit 1