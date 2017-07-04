class Metadata {
    constructor(dir, file) {
        this.dir = dir;
        this.file = file;
        this.data = {
            keywords: []
        };
        
        this.read();
    }
    
    read() {
        
    }
}

module.exports = Metadata;