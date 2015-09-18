var rootRef = new Firebase('https://sghackatron.firebaseio.com');
var userData;

rootRef.onAuth(function(authData) {
  if (authData !== null) {
    userData = authData;
    console.log("Authenticated successfully with payload:", authData);
  } else {
    rootRef.authWithOAuthRedirect("github", function(error) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        // We'll never get here, as the page will redirect on success.
      }
    });
  }
})

var bourbon_category_data = [
  {
    'voting_category_id': 2,
    'voting_category_name': 'Most Enterprise Value'
  },
  {
    'voting_category_id': 3,
    'voting_category_name': 'Most Usable Today'
  },
  {
    'voting_category_id': 4,
    'voting_category_name': 'Most Outside of Comfort Zone'
  },
  {
    'voting_category_id': 5,
    'voting_category_name': 'Best Technical Achievement'
  }
];

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ProjectList = React.createClass({
  getInitialState: function() {
    // Determine if user has already submitted ballot
    var ballotsRef = rootRef.child("ballots");
    ballotsRef.on("value", function(snapshot) {
      console.log(snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
    return {
      "votes": [],
      "bourbon_votes": [],
      "projects": [],
      "ballot_submitted": false
    };
  },
  componentDidMount: function() {
    var ref = rootRef.child('projects');
    ref.on("value", function(snapshot) {
      this.setState({"projects": snapshot.val()});
    }.bind(this));
  },
  makeVote: function(id) {
    var arr_index = this.state.votes.indexOf(id);
    if(arr_index > -1 ) {
      var new_array = this.state.votes.slice();
      new_array.splice(arr_index, 1);
      this.setState({"votes": new_array});
    } else {
      var new_array = this.state.votes.slice();
      new_array.push(id);
      this.setState({"votes": new_array});
    }
  },
  makeBourbonVote: function(project_id, voting_category_id) {
    var new_array = this.state.bourbon_votes.slice();
    new_array.push({
      'project_id': project_id,
      'voting_category_id': voting_category_id
    });
    this.setState({'bourbon_votes': new_array});
  },
  submitBallot: function() {
    var that = this;
    var votes_array = [];
    _.each(this.state.votes, function(vote) {
      votes_array.push({
        'project_id': vote,
        'voting_category_id': 1
      });
    });
    var all_votes = votes_array.concat(this.state.bourbon_votes);
    var ballotsRef = rootRef.child("ballots");
    var newBallotRef = ballotsRef.push();
    newBallotRef.set({
      'user_id': userData.github.username,
      'votes': all_votes
    }, function(error) {
      if(error) {
        alert("Data could not be saved." + error);
      } else {
        that.setState({'ballot_submitted': true});
      }
    });
  },
  getBourbonPrompt: function() {
    if(this.state.bourbon_votes.length === 4) {
      return(
        <span></span>
      );
    } else if(this.state.bourbon_votes.length === 0) {
      return(
        <span> & Your Bourbon Prize Winners</span>
      );
    } else if(this.state.bourbon_votes.length === 3) {
      return(
        <span> & <b>1</b> More Bourbon Prize Winner</span>
      );
    } else if(this.state.bourbon_votes.length === 2) {
      return(
        <span> & <b>2</b> More Bourbon Prize Winners</span>
      );
    } else if(this.state.bourbon_votes.length === 1) {
      return(
        <span> & <b>3</b> More Bourbon Prize Winners</span>
      );
    }
  },
  getVotePrompt: function() {
    var bourbon_prompt = this.getBourbonPrompt();
    if(this.state.votes.length === 0) {
      return (
        <p>
          Chose Your Favorite <b>3</b> Projects{bourbon_prompt}
        </p>
      );
    } else if(this.state.votes.length === 1) {
      return (
        <p>
          Chose <b>2</b> More Favorite Projects{bourbon_prompt}
        </p>
      );
    } else if(this.state.votes.length === 2) {
      return (
        <p>
          Chose <b>1</b> More Favorite Project{bourbon_prompt}
        </p>
      );
    } else if(this.state.votes.length === 3) {
      return (
        <div className="submit_ballot_button" onClick={this.submitBallot}>
          Submit Your Ballot
        </div>
      );
    } else if(this.state.votes.length > 3) {
      return (
        <p>
          You Have Too Many Projects Selected. Please Only Vote for 3.
        </p>
      );
    }
    console.log(this.state.prompt);
  },
  render: function() {
    if (this.state.projects.length > 0) {
      var projectNodes = this.state.projects.map(function (project) {
        return (
          <Project make_vote={this.makeVote} make_bourbon_vote={this.makeBourbonVote} project={project} vote_list={this.state.votes} bourbon_vote_list={this.state.bourbon_votes} bourbon_choices={bourbon_category_data}/>
        );
      }.bind(this));
    } else {
      var projectNodes = [];
    }
    return (
      <div id="content_wrap" className={this.state.ballot_submitted ? 'ballot_submitted' : 'ballot_not_submitted'}>
        <div id="fixed">
          <nav className="nav">
            <a href="/" id="logo"></a>
          </nav>
          <div id="pick_section">
            {this.getVotePrompt()}
          </div>
        </div>
        <div className="projectList animate fadeIn">
          {projectNodes}
        </div>
        <div className="ballot_submitted_message animate fadeInUp">
          <div className="submitted_icon"></div>
          <h4>ballot<br />submitted</h4>
        </div>
      </div>
    );
  }
});

var Project = React.createClass({
  getInitialState: function() {
    return {
      'voted': false,
      'bourbon_state': 'closed',
      'bourbon_cateogry_slected': ''
    };
  },
  handleClick: function(event) {
    this.props.make_vote(this.props.project.id);
  },
  handleBourbonClick: function(event) {
    this.setState({
      'bourbon_state': 'picking'
    });
  },
  handleBourbonVote: function(event) {
    var already_voted = _.some(this.props.bourbon_vote_list, function(vote) {
      return vote.voting_category_id == event.target.dataset.id;
    });
    if(already_voted) {
      alert('You already chose another project to win that prize');
    } else {
      this.props.make_bourbon_vote(this.props.project.id, event.target.dataset.id);
      var bourbon_cateogry_slected = _.filter(bourbon_category_data, function(category) {
        return category.voting_category_id == event.target.dataset.id
      });
      this.setState({
        'bourbon_state': 'picked',
        'bourbon_cateogry_slected': bourbon_cateogry_slected[0].voting_category_name
      });
    }
  },  
  getVoteButtonText: function() {
    if(this.props.vote_list.indexOf(this.props.project.id) > -1) {
      return "voted!";
    } else {
      return (
        <span>
          fave
          <br />
          vote
        </span>
      );
    }
  },
  closeBourbonChoices: function() {
    this.setState({
      'bourbon_state': 'closed'
    });
  },
  render: function() {
    var that = this;
    // var authorNodes = this.props.project.members.map(function (author) {
    //   var render_name;
    //   if(author.name) {
    //     render_name = author.name;
    //   } else {
    //     render_name = author.username;
    //   }
    //   return (
    //     <div className="author">
    //       <label>{render_name}</label>
    //       <img src={author.avatar_url} />
    //     </div>
    //   )
    // });
    var bourbonNodes = this.props.bourbon_choices.map(function (choice) {
      return (
        <li data-id={choice.voting_category_id} onClick={that.handleBourbonVote} className="choice">
          {choice.voting_category_name}
        </li>
      )
    });
    var votedClassString = "vote_button";
    var votedButtonText = "vote"
    if(this.props.vote_list.indexOf(this.props.project.id) > -1) {
      votedClassString += " voted_state_true";
      votedButtonText = "voted!";
    } else {
      votedClassString += " voted_state_false";
    }
    if(this.state.bourbon_state === 'closed') {
      var bourbonChoicesStyle = {
        display: 'none'
      };
      var bourbonVoteButton = {
        display: 'block'
      };
      var bourbonCategorySelectedStyle = {
        display: 'none'
      };
    } else if(this.state.bourbon_state === 'picking') {
      var bourbonChoicesStyle = {
        display: 'block'
      };
      var bourbonVoteButton = {
        display: 'none'
      };
      var bourbonCategorySelectedStyle = {
        display: 'none'
      };      
    } else if(this.state.bourbon_state === 'picked') {
      var bourbonChoicesStyle = {
        display: 'none'
      };
      var bourbonVoteButton = {
        display: 'none'
      };
      var bourbonCategorySelectedStyle = {
        display: 'block'
      };  
    }
    return (
      <div className="project">
        <div className="project_container">
          <h3 className="projectTitle">
            <div className={votedClassString} onClick={this.handleClick}>{this.getVoteButtonText()}</div>
            {(this.props.project.name.length > 1) ? this.props.project.name : this.props.project.username}
          </h3>
          <div className="authors">
          </div>
          <p className="description">
            {this.props.project.description}
          </p>
          <div className="lower_area">
            <a className="project_link" target="_blank" href={this.props.project.submission_url}>Check it out</a>
            <div style={bourbonVoteButton} className="vote_button bourbon_vote_button voted_state_false" onClick={this.handleBourbonClick}>
              bourbon
            </div>
            <div style={bourbonChoicesStyle} className="bourbon_choices_wrapper animated fadeIn">
              <span className="close_bourbon_choices" onClick={this.closeBourbonChoices}>close</span>
              <h5>Choose a Bourbon Prize:</h5>
              <ul className="bourbon_choices">{bourbonNodes}</ul>
            </div>
            <div style={bourbonCategorySelectedStyle} className="bourbon_choice_selected animated fadeInRight">
              <i className="fa fa-glass"></i> {this.state.bourbon_cateogry_slected}
            </div>            
          </div>
        </div>
      </div>
    );
  }
});

React.render(
  <ProjectList />,
  document.getElementById('content')
);