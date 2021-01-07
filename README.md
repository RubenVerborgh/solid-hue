# Philips Hue module for the Community Solid Server
[![npm version](https://badge.fury.io/js/solid-hue.svg)](https://www.npmjs.com/package/solid-hue)

💡 Control your [Philips Hue Lights](https://www.philips-hue.com/)
from within [Solid](https://solidproject.org/) applications.


## What it is
- The [Community Solid Server](https://github.com/solid/community-server/)
  allows people to expose their data on the Web behind access control.
- This `philips-hue` npm package provides a plug-in store for the Community Solid Server
  that exposes your Philips Hue lights as read/write documents.
- Solid apps can thereby access your light setup
  as if they would access any other document.


## How to install
From the npm package registry:
```shell
mkdir my-server
cd my-server
npm install @solid/community-server@v0.4.0 solid-hue
```

As a developer:
```shell
git clone git@github.com:RubenVerborgh/solid-hue.git
cd solid-hue
npm ci
```

## How to configure
Create a file `settings.json`
from [this template](https://github.com/RubenVerborgh/solid-hue/blob/main/settings-example.json),
and filling out your settings.

You can obtain your settings
by [creating a new Philips Hue App](https://developers.meethue.com/my-apps/)
and following the [set-up steps](https://developers.meethue.com/develop/hue-api/remote-api-quick-start-guide/).


## How to run
Execute the following command:
```shell
npx community-solid-server settings.json
```

Now you can access your lights
from http://localhost:3000/home/lights


## License

©2020–2021 Ruben Verborgh, [MIT License](https://github.com/RubenVerborgh/philips-hue/blob/master/LICENSE.md)
