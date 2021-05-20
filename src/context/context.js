import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';




const GithubContext = React.createContext();

const GithubProvider = ({children}) =>{
  const [githubUser, setGithubUser] = useState({})
  const [repos, setRepos] = useState([])
  const [followers, setFollowers] = useState([])

  const [requests, setRequests] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState({show: false, msg: ''})

  const searchGithubUser = async (user) =>{
    toggleError('')
    setLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`).
    catch(err =>console.log(err))
    if (response){
      setGithubUser(response.data)
      const {login, followers_url} = response.data
      getReposAndFollowers(login, followers_url)
      
    }else{
      toggleError(true, 'no user with username')
    }
    checkRequests()
    setLoading(false)
  }

  const getReposAndFollowers = async(login, followers_url) =>{
    await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`)
      ]).then((result) =>{
        const [repos, followers] = result
        const status = 'fulfilled'
        if(repos.status === status){
          setRepos(repos.value.data)
        }
        if(followers.status === status){
          setFollowers(followers.value.data)
        }
      }).catch(error => console.log(error))
  }
  
  //chech rate
  const checkRequests = () =>{
    axios(`${rootUrl}/rate_limit`).then(({data}) => {
      let {rate: {remaining}} = data
      setRequests(remaining)
      if(remaining === 0){
        toggleError(true, 'sorry you are out of requests!')
      }
    }).catch(error => console.log(error))
  }

  function toggleError(show=false, msg=''){
    setError({show, msg})
  }

  useEffect(checkRequests,[])
  
  
  return <GithubContext.Provider value={
    {githubUser, repos, followers, requests, error, searchGithubUser, loading}
  }>{children}</GithubContext.Provider>
}

export  {GithubContext, GithubProvider};