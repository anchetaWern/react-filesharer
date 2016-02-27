var React = require('react');
var ReactDOM = require('react-dom');
var Filesharer = require('./components/filesharer.jsx');



var options = {
	peerjs_key: 'your peer cloud service key'
};

var Main = React.createClass({
  render: function () {
    return <Filesharer opts={options} />;
  }
});

var main = document.getElementById('main');

ReactDOM.render(<Main/>, main);
