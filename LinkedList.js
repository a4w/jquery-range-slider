class LinkedListNode{
    next = null;
    prev = null;
    constructor(data){
        this.data = data;
    }

    static insertAfter(node, data){
        let newNode = new LinkedListNode(data);
        node.next.prev = newNode;
        newNode.next = node.next;
        newNode.prev = node;
        node.next = newNode;
        return node;
    }

    static remove(node){
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
}

class LinkedList{
    constructor(){
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /*
    Inserts a new node at the end of the linked list
    @param data to be stored inside the node
    @return created node
    */
    insert(data){
        let node = new LinkedListNode(data);
        if(this.head === null){
            this.head = node;
            this.tail = node;
        }else{
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this.size++;
        return node;
    }

    insertFront(data){
        let node = new LinkedListNode(data);
        if(this.head === null){
            this.head = node;
            this.tail = node;
        }else{
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        this.size++;
        return node;
    }


    insertAt(index, data){
        if(index < 0 || index >= this.size){
            throw "Index out of bounds";
        }
        if(index === 0){
            return this.insertFront(data);
        } else if(index === this.size){
            return this.insert(data);
        }else{
            let current = this.head;
            let i = 0;
            while(current !== null && i < index){
                current = current.next;
                i++;
            }
            // Current contains the node at position i
            this.size++;
            return LinkedListNode.insertAfter(current, data);
        }
    }
  
    get(index){
        if(index < 0 || index >= this.size()){
            throw "Index out bounds";
        }
        let current = this.head;
        let i = 0;
        while(current !== null && i < index){
            current = current.next;
            i++;
        }
        return current;
    }

    remove(node){
        LinkedListNode.remove(node);
        this.size--;
    }

    isEmpty(){
        return this.size === 0;
    }

    first(){
        return this.head;
    }

    last(){
        return this.tail;
    }
    
    forEach(callback){
        let current = this.head;
        let i = 0;
        while(current !== null){
            if(callback(i, current) === false)
                break;
            i++;
        }
    }

}