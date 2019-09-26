update-concourse:
	fly -t wonderchat set-pipeline -p wonderchat -c ci/concourse.yml -l ci/concourse-secrets.yml
