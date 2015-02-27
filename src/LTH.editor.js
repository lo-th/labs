/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

LTH.CodeEditor = function(main, type){
	this.type = type || 'base';
	this.main = main;
	this.doc = document;
	this.editor = null;
	this.interval = null;
	this.mode = '';
	this.currentName = '';

	this.content = this.doc.createElement('div');
	this.content.className = 'editor';
	this.content.id = 'editor'+this.type;
	this.doc.body.appendChild( this.content );

	this.errorLines = [];
	this.widgets = [];

	this.isEnd = false;
	this.isStart = false;
	this.init();
}

LTH.CodeEditor.prototype = {
	constructor: LTH.CodeEditor,
	init:function(){
		this.editor = CodeMirror(this.content, {
	        lineNumbers: true,
	        matchBrackets: true,
	        indentWithTabs: true,
	        styleActiveLine: true,
	        theme:'monokai',
	        mode:'text/javascript',
			tabSize: 4,
			indentUnit: 4,
			highlightSelectionMatches: {showToken: /\w/}
	    });
	    var _this = this;
	    if(this.type==='base') this.editor.on('change', function() { _this.onChange() } );
	},
	onChange:function(){
		var _this = this;
		this.mode = this.editor.getOption('mode');
		if(!this.end){
			clearTimeout( this.interval );
			var value = this.editor.getValue();
			if ( this.validate( value )) this.interval = setTimeout( function() {_this.main.update(value, true);}, 500);
		}
	},
	get:function(){
		return this.editor.getValue();
	},
	set:function(text){
		this.editor.setValue(text);
	},
	changeTheme:function(n){
		if(n==0) this.editor.setOption("theme", "default");
		else this.editor.setOption("theme", "monokai");
	},
	deleteAll:function(){
		this.clear();
		this.doc.body.removeChild( this.content );
		this.content = null;
	},
	clear:function(){
		this.isEnd = true;
		this.main.showCode = false;
		this.content.style.display = 'none';
		this.editor.setValue('');
	    //this.editor.refresh();
	},
	refresh:function(){
	    this.editor.refresh();
	},
	changeFontSize:function(size){
	    this.editor.getWrapperElement().style["font-size"] = size+"px";
	    this.refresh();
	},
	close:function (){
		this.editor.getInputField().blur();
	},
	blur:function (){
		this.editor.getInputField().blur();
	},
	validate:function( value ){
		var editor = this.editor;
		var mode = this.mode;
		var _this = this;
		
		return editor.operation( function () {
			while ( _this.errorLines.length > 0 ) {
				editor.removeLineClass( _this.errorLines.shift(), 'background', 'errorLine' );
			}
			for ( var i = 0; i < _this.widgets.length; i ++ ) {
				editor.removeLineWidget( _this.widgets[ i ] );
			}
			_this.widgets.length = 0;
			var string = value;

			try {
				var result = esprima.parse( string, { tolerant: true } ).errors;
				for ( var i = 0; i < result.length; i ++ ) {
					var error = result[ i ];
					var message = document.createElement( 'div' );
					message.className = 'esprima-error';
					message.textContent = error.message.replace(/Line [0-9]+: /, '');
					var lineNumber = error.lineNumber - 1;
					_this.errorLines.push( lineNumber );
					editor.addLineClass( lineNumber, 'background', 'errorLine' );
					var widget = editor.addLineWidget( lineNumber, message );
					_this.widgets.push( widget );
				}
			} catch ( error ) {
				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message.replace(/Line [0-9]+: /, '');
				var lineNumber = error.lineNumber - 1;
				_this.errorLines.push( lineNumber );
				editor.addLineClass( lineNumber, 'background', 'errorLine' );
				var widget = editor.addLineWidget( lineNumber, message );
				_this.widgets.push( widget );
			}
			return _this.errorLines.length === 0;
		});
	}
}