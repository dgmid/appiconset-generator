# ![appiconset-generator-icon](https://user-images.githubusercontent.com/1267580/54089465-6cf2f680-4369-11e9-851d-a227059f3369.png) Appiconset Generator

A utility app for generating Apple **appiconsets** for **macOS** **iOS** and **watchOS** from an original 1024 x 1024 design. All icon sizes and a Contents.json file are automatically generated and saved in a `.appiconset` folder.

You can choose the image interpolation algorithm used from:

- Nearest Neighbour
- Cubic (Catmull–Rom spline)
- Mitchell-Netravali spline
- Lanczos a=2
- Lanczos a=3

## Main Window
![appiconset-generator](https://user-images.githubusercontent.com/1267580/59580720-8fb44a00-90d2-11e9-94bd-c1a3fe175466.png)

## Touch Bar

Appicionset Generator has support for the Touch Bar

![appiconset-generator-touchbar](https://user-images.githubusercontent.com/1267580/59580724-904ce080-90d2-11e9-9502-33f4910aeeff.png)

## Requirements

[node.js / npm](https://www.npmjs.com/get-npm)

To modify a/o build this project you will need to install electron-packager

```shell
npm install electron-packager -g
```

## Usage

`cd` to the project directory and run:
```shell
npm install
```

then run
```shell
npm run rebuild
```

To modify the `html` / `css` / `js` run:
```shell
gulp watch
```

To test the app run:
```shell
npm start
```

To update all files prior to packaging run:
```shell
gulp build
```

To package the final app run:
```shell
npm run package
```
The packaged app will be written to `build/Appiconset Generator-darwin-x64/` in the project directory.

**Note**: packaging the app runs `npm prune -production` and so you will need to run `npm install` again before making any further modifications.

## License

**Appiconset Generator** is released under the MIT Licence
