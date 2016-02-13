var React = require('react');
var randomstring = require('randomstring');
var Peer = require('peerjs');

module.exports = React.createClass({
	getInitialState: function(){
		return {
			peer: new Peer({key: this.props.opts.peerjs_key}), //for testing
			/*
			//for production:
			peer = new Peer({
			  host: 'yourwebsite.com', port: 3000, path: '/peerjs',
			  debug: 3,
			  config: {'iceServers': [
			    { url: 'stun:stun1.l.google.com:19302' },
			    { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
			  ]}
			})
			*/
			my_id: '',
			peer_id: '',
			initialized: false,
			files: [
				
			]
		}
	},
	componentWillMount: function() {
		
		this.state.peer.on('open', (id) => {
			console.log('My peer ID is: ' + id);
			this.setState({
				my_id: id,
				initialized: true
			});
		});


		this.state.peer.on('connection', (connection) => {
			console.log('someone connected');
			console.log(connection); 

			this.setState({
				conn: connection
			}, () => {

				this.state.conn.on('open', () => {
					this.setState({
						connected: true
					});
				});

				this.state.conn.on('data', this.onReceiveData);

			});


		});

	},

	connect: function(){

		var peer_id = this.state.peer_id;

		var connection = this.state.peer.connect(peer_id);

		this.setState({
		    conn: connection
		}, () => {
			this.state.conn.on('open', () => {
				this.setState({
					connected: true
				});
			});

			this.state.conn.on('data', this.onReceiveData);
		
		});

	},

	sendFile: function(event){
	    console.log(event.target.files);
	    var file = event.target.files[0];
	    var blob = new Blob(event.target.files, {type: file.type});

	    this.state.conn.send({
	        file: blob,
	        filename: file.name,
	        filetype: file.type
	    });

	},

	onReceiveData: function(data){

		console.log('Received', data);

		var reader = new FileReader();
		
		var blob = new Blob([data.file], {type: data.filetype});

		reader.readAsDataURL(blob);

		var component = this;

		reader.onload = function(){
			var file_url = event.target.result;
			var file_name = data.filename;

			var files = component.state.files;
			var file_id = randomstring.generate(5);

			console.log(file_id);
			
			files.push({
				id: file_id,
				url: file_url,
				name: file_name
			});

			component.setState({
				files: files
			});
			
		}

		

	},

	listFiles: function(){

		if(this.state.files.length){

			var file_list = this.state.files.map(function(file){
				return (
					<li key={file.id}>
						<a href={file.url} download={file.name}>{file.name}</a>
					</li>
				)
			});

			return (
				<div id="file_list">
				<span id="has_file_message">{this.props.opts.file_list_label || 'Files shared to you: '}</span>
					<ul>
					{file_list}
					</ul>
				</div>
			)

		}

		return <span id="no_files_message">{this.props.opts.no_files_label || 'No files shared to you yet'}</span>;
	},

	handleTextChange: function(event){

		this.setState({
		  peer_id: event.target.value
		});

	},

	render: function() {
		return (
			<div>
			{
				this.state.initialized && 
				<div>
					<div id="id_container">
						{this.props.opts.my_id_label || 'Your PeerJS ID:'} <span id="my_id">{this.state.my_id}</span>
					</div>
					

					{
						!this.state.connected && 
						<div id="connector_container">
							{this.props.opts.peer_id_label || 'Peer ID'} <input type="text" id="peer_id" onChange={this.handleTextChange} />
							<button id="connect" onClick={this.connect}>{this.props.opts.connect_label || 'connect'}</button>
						</div>
					}

					{
						this.state.connected && 
						<div>
							<div id="fileinput_container">
								{this.props.opts.file_label || 'File'} <input type="file" name="file" id="file" onChange={this.sendFile} />
							</div>
							<div id="files_container">
								{this.listFiles()}
							</div>
						</div>
					}

				</div>
			}
			</div>
		)
	}
});