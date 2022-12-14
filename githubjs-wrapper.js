import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

window.github = function (authkey) {
    const myOctokit = new Octokit({ auth: authkey });
    const owner = "dirkarnez";
    const repo = "githubjs-wrapper";

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

    const getFileBySha = (fileSha) => {
        return myOctokit
        .request("GET /repos/:owner/:repo/git/blobs/:file_sha", {
            owner: owner,
            repo: repo,
            file_sha: fileSha
        });
    }

    return {
        createFileWithStringContent: function(filename, content) {
            return myOctokit.request('PUT /repos/:owner/:repo/contents/:path', {
                owner: owner,
                repo: repo,
                path: filename,
                message: `- add ${filename}`,
                content: btoa(content),
            });
        },
        readAsObjectURL: function(fileSha) {
            return getFileBySha(fileSha)
            .then(response => {
                return URL.createObjectURL(base64ToBlob(response.data.content));
            });
        },
        readAsString: function(fileSha) {
            return getFileBySha(fileSha)
            .then(response => {
                return base64ToBlob(response.data.content).text();
            });
        },
        readBranchRecursive: function(branchName) {
            return myOctokit
            .request("GET /repos/{owner}/{repo}/branches/{branch}", {
                owner: owner,
                repo: repo,
                branch: branchName
            })
            .then(response => myOctokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                owner: owner,
                repo: repo,
                tree_sha: response.data.commit.commit.tree.sha,
                recursive: "true"
            }));
        },
        updateStringContentOfAFile: function(filename, sha, content) {
            return myOctokit.request('PUT /repos/:owner/:repo/contents/:path', {
                owner: owner,
                repo: repo,
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