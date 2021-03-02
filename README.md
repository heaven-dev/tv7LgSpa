# tv7LgSpa

This LG smart TV app is implemented using __Vanilla JS__. Application is implemented as a single-page application (SPA).

## Demo

Similar app running on Samsung TV emulator.

![Demo](https://github.com/heaven-dev/demo/blob/main/demo/demo.gif)

## Overview

__TV7__ web sites:
  - [Taivas TV7](https://www.tv7.fi/)
  - [Taevas TV7](https://www.tv7.ee/)
  - [Himlen TV7](https://www.himlentv7.se/)
  - [Небеса ТВ7](https://www.nebesatv7.com/)

Application make possible to watch TV channel and videos from the video archive. The application supports the following locales:
  - __fi__: Finnish
  - __et__: Estonian
  - __sv__: Swedish
  - __ru__: Russian

Each locale is an independent application. You have to use __gulp__ to generate a localized application. Instructions are below.

## Instructions

### Download and install git
  - If your computer OS is windows you can download the git from [here](https://git-scm.com/download/win).
  - If your computer OS is linux (Ubuntu) you can install git using package manager.

### Clone repository
Clone this repository to your computer disk.
  - __git clone https://github.com/heaven-dev/tv7LgSpa.git__

### Download and install node (version 14.x.x)
  - If your computer OS is windows you can download node from [here](https://nodejs.org/en/download/).
  - If your computer OS is linux (Ubuntu) you can install node using package manager.

### Install dependencies
  - In the root folder of the project: __npm install__

### Install gulp-cli
  - __sudo npm install -g gulp-cli__
  - Gulp is used to build the app.
    - Build __finnish__ locale app: __npm run build-fi__
    - Build __estionian__ locale app: __npm run build-et__
    - Build __swedish__ locale app: __npm run build-sv__
    - Build __russian__ locale app: __npm run build-ru__
    - Build all: __npm run build-all__
  - Build is created under the __root folder__ of this project for example __dist/fi__ and respectively to each locale.
  - __HTML__, __CSS__ and __javascript__ files are compressed by the above build commands.
    - Build uncompressed version with the following commands:
      - Build __finnish__ locale app: __gulp uncompress_fi__
      - Build __estionian__ locale app: __gulp uncompress_et__
      - Build __swedish__ locale app: __gulp uncompress_sv__
      - Build __russian__ locale app: __gulp uncompress_ru__

### Download and install VirtualBox (>= 5.2.22)
  - __VirtualBox__ is needed to run the application on an emulator.
  - Install the __VirtualBox 5.2.22__ from [here](https://www.virtualbox.org/wiki/Download_Old_Builds_5_2) to your computer.
  - If you are using linux (Ubuntu) you can install the __VirtualBox__ using package manager.
  - If you have already a newer version of __VirtualBox__ installed to your computer you can try it at first.

### Download and install WebOS SDK
  - Download WebOS SDK from [here](http://webostv.developer.lge.com/sdk/installation/).
  - Select __Minimal Installer__ package.
  - Select package OS.
  - Save package to disk and start a setup.
  - When the setup is done, open the webOS __Component Manager TV__ from the start menu.
  - Select __Install__ button to the __Emulator v5.0.0__. The __Componen Manager TV__ downloads and installs emulator version 5.0.0.
  - When the installation is done you need to restart your computer in order the SDK CLI commands will work properly.

### Import project into the IDE
  - You can use your favorite IDE.

### Run application on emulator
  - Start __WebOS TV Emulator v5.0.0__ from the start menu. It is under the same menu as the __Component Manager TV__ application.
  - When emulator is started, select __webOS CLI for TV__ from the start menu. 
  - When a new terminal windows is opened, change your working directory to the __root folder__ of this project.
    - Run __finnish__ locale app: __npm run run-fi__
    - Run __estonian__ locale app: __npm run run-et__
    - Run __swedish__ locale app: __npm run run-sv__
    - Run __russian__ locale app: __npm run run-ru__

### Run application on TV
  - Instructions how to test are [here](https://webostv.developer.lge.com/develop/app-test/).

### Run application on a browser
It is easier to develop and test the application if the application is capable to run on a browser. You can use for example the __live-server__ to run this application on the browser.

#### Install live-server
  - __sudo npm install -g live-server__
  - Usage: Run the __live-server__ command in the root folder of the built application for example the __projectRoot/dist/fi__ folder.
    
#### Enable browser in code of the application
  - Set [this](https://github.com/heaven-dev/tv7LgSpa/blob/master/js/util/constants.js#L3) flag to __true__.
  - Now build the application for example __npm run build-fi__ and then change the working directory to the __projectRoot/dist/fi__ and start the __live-server__. You need the __WebOS CLI for TV__ terminal to run above build command. You can find it from the start menu if you have already installed the __WebOS SDK__.

### webOS TV version required to run this application 
  - __WebOS TV 3.x or newer__ (release year of webOS TV 3.x is 2016)
    - webOS TV [web engine](http://webostv.developer.lge.com/discover/specifications/web-engine/)

### Useful links
  - [webOS TV](http://webostv.developer.lge.com/) developer web pages.
  - [CLI commands](http://webostv.developer.lge.com/sdk/tools/using-webos-tv-cli/).
  - [WebOS app testing](https://webostv.developer.lge.com/develop/app-test/).

### License
 - [MIT](https://github.com/heaven-dev/tv7LgSpa/blob/master/LICENSE.md)

 