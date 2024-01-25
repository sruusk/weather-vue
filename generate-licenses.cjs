// noinspection NodeCoreCodingAssistance

const nlf = require('nlf');
const fs = require('fs');

nlf.find({
    directory: './',
    production: true
}, function(err, data) {
    if(err) {
        console.error(err);
        return;
    }

    let licenses = data.map((d) => {
        return {
            name: d.name,
            version: d.version,
            license: d.licenseSources.package.sources[0]?.license,
            text: d.licenseSources.license.sources[0]?.text,
        };
    });

    licenses = licenses.filter((l) => l.text);

    fs.writeFile('./src/assets/licenses.json', JSON.stringify(licenses, null, 2), (err) => {
        if(err) {
            console.error(err);
            return;
        }
        console.log('Licenses generated');
    });
});
