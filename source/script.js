//VZI projekt Trie data structure
//VUTID: 208479
//Roman ?ervenka
// json subor je umiestneny na serveri http://pscvyhledavac.infinityfreeapp.com/psc.json nakolko fetch nefunguje pre local file


//get required elements
const inputBox = document.querySelector("input");
const suggestionBox = document.getElementById("suggestions");

//classes
class TreeNode{
    constructor(value){
        this.val = value;
        this.next = Array(10).fill(null); //initialize to null values
    }
    children(){
        let out = Array();
        for(let x of this.next){
            if (x !== null) out.push(x);
        }
        return out
    }
    
}
class EndNode{
    constructor(code, city){
        this.code = code;
        this.city = city;
    }
}

class Trie{
    constructor(){
        this.start = new TreeNode("");
    }
    addcode(code,city){
        let current = this.start;
        let digits = code.toString().split('').map(Number);
        let i = 0;
        while(i < digits.length - 1){
            if (current.next[digits[i]] !== null){
                current = current.next[digits[i]];
            }
            else{
                current.next[digits[i]] = new TreeNode(digits.slice(0,i+1).join('')); //create new node with first i digits
                current = current.next[digits[i]];
            }
            i++;
        }
        //last node will be EndNode class
        if(current.next[digits[i]] === null) // if city with this code is not added yet, add it 
        current.next[digits[i]] = new EndNode(digits.join(''), city);
        
    }
    findcode(code){ //dynamic return is used instead to dynamicly find code
        let current = this.start;
        let digits = code.toString().split('').map(Number);
        let i = 0;
        while(i < digits.length - 1){
            current = current.next[digits[i]];
            i++;
        }
        return current.next[digits[i]].code + ": " + current.next[digits[i]].city 
        
    }
    dynamicreturn(code){
        let current = this.start;
        let digits = code.toString().split('').map(Number);
        for(let x of digits){
            if( current instanceof EndNode)
                return ["Nenajdene"];
            if(current.next[x] == null)
                return ["Nenajdene"];
            current = current.next[x];
        }
        if (current instanceof EndNode) return [current.code + ", " + current.city];
        let out = [];
        let childnodes = current.children(); //take only not null children
        while (!(childnodes[0] instanceof EndNode)){
            let newlist = [];
            for(let node of childnodes){ 
                newlist = newlist.concat(node.children());
                if(newlist.length > 10) break; //only check 1st 10 children, limits list size 
            }
            childnodes = newlist;
        }
        out = childnodes.map( x => x.code + ", " + x.city);
        console.log(out);
        return out
    }
}

let data; //load zip codes
let t = new Trie();
function loadCodesToTrie(d){

    for(let x = 0; x < d.length;){
        t.addcode(d[x]["psc"], d[x]["mesto"] +  ((d[x]["okres"] == "")? "" : (", " + d[x]["okres"])) + ", " + d[x]["stat"] );
        x++;
    }
}
fetch("http://pscvyhledavac.infinityfreeapp.com/psc.json", {
    method: 'GET'
})
.then(function(response){ return response.json(); })
.then(function(json){data = json[2]["data"]; loadCodesToTrie(data)}) //initialize trie and fill with codes


inputBox.onkeyup = (e)=>{
    console.log(inputBox.value == "");
    if(inputBox.value == ""){ 
        suggestionBox.innerHTML = "";
        return
    }
    let reg = /\d+/;
    if(!reg.test(inputBox.value)){
        suggestionBox.innerHTML = "<ul>Chyba! Nie je PSC, piste len platne PSC.</ul>";
        return
    }
    if(inputBox.value == "") {
        suggestionBox.innerHTML ="";
        return
    }
    else{
        let input = inputBox.value;
        let output = [];
        output = t.dynamicreturn(input)
        if (output == null) suggestionBox.innerHTML = "";
        else{
            output = output.map(x => "<ul>" + x + "</ul>");
            suggestionBox.innerHTML = output.join('');
            console.log(output);
        }
    }
}
