# PadStats
React and Node App that utilize Google Maps and Places API.

## Getting Started
1.  `npm install`
2.  `npm run dev`

## Notes
1.  Cluttered config (difficult to debug,find scripts, transformations, or any low level configs)
2.  Config overkill
3.  Unorganized files
4.  Empty files
5.  Limited comments for dense code 
6.  Cluttered server file
7.  Hardcoded mongo server 
8.  Should wrap your db and other integrations in seperate files
9.  Let of bulk, can't open up the final .js file (too big)
10.  `Uncaught Error: Cannot find module "react-addons-css-transition-group"` <- Error
	- Used in About.js, not specified in package.json
11. Know your code!  Best learning experience is to know your own code.  Although difficult at times, make honest attempts to never add something that you aren't sure how it works or what it does.  When something goes wrong, you want to at least know where to look
12.  Don't let ANY warning slide.  These will eventually kill your app!  Warnings are there for a reason.  They prevent low lying REALLY difficult bugs from appearing in your application.  Take them seriously
13. Although it doesn't seem like your code is the culprit here, a solid understanding of your packages will show you the way.  I think this is bootstrap.. but I use the same version in my application.  I'm seeing `bootstrap` and `react-bootstrap`.  That can't be good (another reason to resolve warning and know your packages.  Both of which cause huge headaches if left unmanaged.  Its not like code to debug, its low level stuff thats a big pain).  Having trouble finding the root for this but `Glyphicon` is definitely a bootstrap item.  It may be another package that utilizes bootstrap though..  Moving on for now to save time
```
warning.js?0260:36Warning: You are manually calling a React.PropTypes validation function for the `formControlFeedback` prop on `Glyphicon`. This is deprecated and will not work in production with the next major version. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details
```
14.  Below warning means your render method of the Container.js component is iterating several components and returning a list.  React needs a `key` prop on each of the iterated components.  This is used for virtual DOM manipulation and performance boosts to easily determine diffs between actual DOM and desired DOM created by React
```
warning.js?0260:36Warning: Each child in an array or iterator should have a unique "key" prop. Check the render method of `Container`. See https://fb.me/react-warning-keys for more information.
```
15.  You have to be really careful in react.  Build deliberate components, test, and continue.  DON'T develop too much at once!!!  Then you get into this situation where there are several points of failure (this remains true for developing in general) like you see here.  React intensifies this situation with masks of terrible error messages and cryptic stack traces.  Not only this but an error could cause a component to render null.  This will trickle into the rest of the application but NOT as a HARD fail!  it will softly fail, display a little error in the console and your app will just be "weird" until you refresh the page.  You need to test as you go, limit points of failure.  One small bug you created months ago due to moving to fast will be impossibly hard to track down later on.  I'm sure you're feeling some of the pains of this already

16.  Several misnomers making it more difficult to track down functionality (Header.js resembles? Doesn't seem like a Header)

17.  Something in Header is erroring out causing the render function to return undefined.  Error below.  Just for clarity, my process to debug this will be to slowly start testing each component for validity.  Test as you go type of stuff.  Then we can pinpoint the culprit for this error.  I suspect MainMap
```
React.createElement: type should not be null, undefined, boolean, or number. It should be a string (for DOM elements) or a ReactClass (for composite components). Check the render method of `Header`.
```

### Example of proper config file (clearly states configuration)
```module.exports = {
	entry: "./app/components/App.js",
	output: {
		filename: "public/bundle.js"
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['react','es2015']
				}
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass']
			},
			{
				test: /\.csv$/, loader: 'dsv-loader'
			},
		]
	}
}
```

#### Demo 
	- http://7ruth.github.io/PadStatsReactJS/   

#### Sources
	- FullStackReact, which can be found here: https://github.com/fullstackreact/google-maps-react