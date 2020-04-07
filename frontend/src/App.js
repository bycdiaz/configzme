import React from "react";
import Landing from "./components/landing/Landing";
import Management from "./components/management/Management";

class App extends React.Component {
  state = {
    username: null,
  };

  componentDidMount() {
    this.checkLoginStatus();
  }

  checkLoginStatus = async () => {
    // TODO Tell user if backend has crashed
    try {
      const response = await fetch("/init?api=true");
      const data = await response.json();

      this.setState({ username: data.username });
    } catch (e) {
      console.log("Error!");
      console.log(e);
    }
  };

  attemptLogin = async (username, password) => {
    console.log(username, password);
    const response = await fetch("/login?api=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    const status = await response.status;
    if (status === 201) {
      this.setState({ username: username });
    }
  };

  logout = async () => {
    await fetch("/logout?api=true", {
      method: "DELETE"
    });

    window.location.reload();
  };

  render() {
    const userView = username => {
      if (username) {
        return (
          <Management
            loggedIn={this.state.username}
            logout={this.logout}
          />
        );
      } else {
        return (
          <Landing attemptLogin={this.attemptLogin}/>
        );
      }
    };

    return (
      <div className="App">
        {userView(this.state.username)}
      </div>
    );
  }
}

export default App;
