import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

window.github = function (authkey) {
    const base64ToBlob = (b64Data, contentType = '', sliceSize = 512)  => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
    
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
            }
    
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
    
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    
    return {
        owner: "",
        repo: "",
        myOctokit: new Octokit({ auth: authkey }),
        init: function(owner, repo) {
            this.owner = owner;
            this.repo = repo;
        }, 
        getFileBySha: function (fileSha){
            return this.myOctokit
            .request("GET /repos/:owner/:repo/git/blobs/:file_sha", {
                owner: this.owner,
                repo: this.repo,
                file_sha: fileSha
            });
        },
        createFileWithStringContent: function(filename, content) {
            return this.myOctokit.request('PUT /repos/:owner/:repo/contents/:path', {
                owner: this.owner,
                repo: this.repo,
                path: filename,
                message: `- add ${filename}`,
                content: btoa(content),
            });
        },
        readAsObjectURL: function(fileSha) {
            return this.getFileBySha(fileSha)
            .then(response => {
                return URL.createObjectURL(base64ToBlob(response.data.content));
            });
        },
        readAsString: function(fileSha) {
            return this.getFileBySha(fileSha)
            .then(response => {
                return base64ToBlob(response.data.content).text();
            });
        },
        readBranchRecursive: function(branchName) {
            return this.myOctokit
            .request("GET /repos/{owner}/{repo}/branches/{branch}", {
                owner: this.owner,
                repo: this.repo,
                branch: branchName
            })
            .then(response => myOctokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner: this.owner,
                repo: this.repo,
                tree_sha: response.data.commit.commit.tree.sha,
                recursive: "true"
            }));
        },
        updateStringContentOfAFile: function(filename, sha, content) {
            return this.myOctokit.request('PUT /repos/:owner/:repo/contents/:path', {
                owner: this.owner,
                repo: this.repo,
                path: filename,
                message: `- update ${filename}`,
                content: btoa(content),
                sha: sha
            });
        },
        delete: function() {

        }
    }
};
