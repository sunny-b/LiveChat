update-concourse:
	fly -t main set-pipeline -p wonderchat -c ci/concourse.yml -l ci/concourse-secrets.yml
