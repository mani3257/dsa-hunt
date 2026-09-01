import { useState } from "react";
import { MonitorCog, ChevronDown, Download, BookOpen } from "lucide-react";

const TOPICS = [
  {
    id: 1,
    title: "Requirements + System Constraints",
    sections: [
      { heading: "What are Requirements?",
        content: "Requirements define what the system should do and the expectations of users and stakeholders. They are the foundation of good system design." },
      { heading: "Types of Requirements",
        content: "Functional Requirements: What the system should do — features, behaviors, API endpoints, etc.\n\nNon-Functional Requirements: How well the system should do it — performance, scalability, reliability, etc." },
      { heading: "Example: Ride Sharing App",
        table: [["Functional Requirements","Non-Functional Requirements"],
          ["User registration & login","Support 1M+ users"],
          ["Book a ride","99.99% availability"],
          ["Match rider with driver","Low latency (< 200ms for API)"],
          ["Real-time location tracking","Scalable to handle high traffic"],
          ["In-app payments","Secure user data & payments"],
          ["Ride history & Notifications","Fault tolerant & highly reliable"]] },
      { heading: "Key System Constraints",
        table: [["Constraint","Description"],
          ["Latency","Time taken to respond to a request. Should be low for good UX."],
          ["Throughput","Number of requests the system can handle per second."],
          ["Scalability","Ability to handle growth (more users, data, traffic)."],
          ["Availability","System uptime and readiness to serve requests."],
          ["Reliability","System should work correctly even in failures."],
          ["Consistency","Data should be accurate and consistent across the system."],
          ["Durability","Data should not be lost even in case of failures."],
          ["Security","Protect data and ensure only authorized access."],
          ["Cost","Optimize infrastructure and operational costs."]] },
      { heading: "Trade-offs (No Free Lunch)",
        content: "• Consistency vs Availability (CAP Theorem)\n• Performance vs Cost\n• Scalability vs Complexity\n\nNote: Understanding requirements and constraints is the first and most important step in system design." },
    ]
  },
  {
    id: 2,
    title: "Scalability",
    sections: [
      { heading: "What is Scalability?",
        content: "Scalability is the ability of a system to handle increasing load by adding resources without degrading performance. A scalable system can grow with demand." },
      { heading: "Types of Scalability",
        table: [["","Vertical Scaling (Scale Up)","Horizontal Scaling (Scale Out)"],
          ["Approach","Add more power (CPU, RAM, SSD) to a single server","Add more servers/instances to distribute the load"],
          ["Cost","High at large scale","Low (at scale)"],
          ["Performance","Limited","High"],
          ["Fault Tolerance","Low","High"],
          ["Complexity","Low","High"]] },
      { heading: "Approaches to Achieve Scalability",
        content: "Load Balancing: Distribute incoming traffic across multiple servers.\n\nStateless Services: Keep services stateless so any server can handle any request.\n\nCaching: Cache frequently used data to reduce load.\n\nDatabase Scaling: Use replication, sharding, and read replicas.\n\nCDN: Deliver content from servers closer to the users.\n\nAsynchronous Processing: Use queues and background jobs to handle heavy tasks." },
      { heading: "Key Takeaways",
        content: "→ Scalability ensures the system can handle growth.\n→ Horizontal scaling is preferred for modern distributed systems.\n→ Use the right combination of techniques based on your use case.\n→ Design for scale from the beginning. It is easier to scale out than scale up at massive scale." },
    ]
  },
  {
    id: 3,
    title: "Availability + Reliability",
    sections: [
      { heading: "What is Availability?",
        content: "Availability is the measure of how often a system is operational and accessible to users. Usually expressed as a percentage of uptime.\n\nAvailability (%) = (Uptime / (Uptime + Downtime)) × 100" },
      { heading: "What is Reliability?",
        content: "Reliability is the ability of a system to function correctly and consistently over time without failures. A reliable system performs as expected, even in adverse conditions." },
      { heading: "Key Differences",
        table: [["","Availability","Reliability"],
          ["Focus","Minimize downtime","Minimize failures"],
          ["Goal","Keep system up","Keep system correct"],
          ["Metric","Uptime %","MTBF, Error rate"],
          ["Question","Is the system up when I need it?","Does the system work correctly all the time?"]] },
      { heading: "High Availability vs Fault Tolerance",
        table: [["High Availability (Reduce Downtime)","Fault Tolerance (Handle Failures)"],
          ["Focus on minimizing downtime","Focus on system's ability to continue working even when parts fail"],
          ["Achieved through redundancy, failover, replication","Achieved through replication, timeouts, retries, graceful degradation"],
          ["Example: Active-Passive setup","Example: Replicated services, retries"]] },
      { heading: "Ways to Achieve High Availability & Reliability",
        content: "Redundancy: Remove single points of failure by duplicating components.\n\nReplication: Keep multiple copies of data to prevent data loss.\n\nLoad Balancing: Distribute traffic across multiple instances.\n\nHealth Checks: Continuously monitor services and restart unhealthy ones.\n\nAutomatic Failover: Automatically switch to a healthy instance on failure.\n\nBackups: Regular backups to recover from disasters.\n\nMonitoring & Alerts: Detect issues early and alert the right people." },
      { heading: "Common Metrics",
        content: "• Uptime % = Measure of availability\n• MTBF (Mean Time Between Failures) = Average time between failures\n• MTTR (Mean Time To Recovery) = Average time to restore service\n• Error Rate = Failed requests / Total requests\n• SLO / SLA = Service level commitments\n\nNote: Design for failure, not for success. Assume something will fail." },
    ]
  },
  {
    id: 4,
    title: "Load Balancing",
    sections: [
      { heading: "What is Load Balancing?",
        content: "Load Balancing is the process of distributing incoming network traffic across multiple servers to ensure no single server is overwhelmed. It improves performance, availability and scalability." },
      { heading: "Why is Load Balancing Important?",
        content: "• Prevents any single server from being a bottleneck\n• Improves response time and user experience\n• Increases system availability and reliability\n• Enables horizontal scaling\n• Helps in efficient resource utilization" },
      { heading: "Types of Load Balancers",
        table: [["Hardware Load Balancer","Software Load Balancer"],
          ["Physical devices","Runs on standard servers"],
          ["High performance and reliability","Cost effective and flexible"],
          ["Expensive","Easy to deploy and scale"],
          ["Example: F5, Citrix ADC","Examples: Nginx, HAProxy, Envoy"]] },
      { heading: "Where Can Load Balancing Occur?",
        table: [["Location","Description"],
          ["Client-Side","Logic to distribute requests is in the client (rare)."],
          ["DNS Load Balancing","Different IPs returned by DNS based on some policy."],
          ["Network Load Balancer (L4)","Operates at Transport layer (TCP/UDP), based on IP and Port."],
          ["Application Load Balancer (L7)","Operates at Application layer (HTTP/HTTPS), understands content (URL, headers)."]] },
      { heading: "Common Load Balancing Algorithms",
        table: [["Algorithm","Description"],
          ["Round Robin (RR)","Requests are distributed sequentially to each server."],
          ["Least Connections (LC)","Requests go to the server with the least active connections."],
          ["IP Hash","Client IP is hashed to a server. Same IP → same server (session stickiness)."],
          ["Weighted Round Robin (WRR)","Servers have different weights based on capacity."],
          ["Least Response Time","Requests go to the server with the fastest response time."],
          ["Random","Requests are sent to a random server."]] },
      { heading: "Key Takeaways",
        content: "• Load balancing is essential for scalable and reliable systems.\n• Use the right algorithm based on your use case.\n• Combine with health checks, auto scaling and monitoring for best results.\n• Good load balancing = Better performance + High availability + Happy users!" },
    ]
  },
  {
    id: 5,
    title: "Caching",
    sections: [
      { heading: "What is Caching?",
        content: "Caching is the process of storing frequently used data in a fast storage (cache) so that future requests for the same data can be served quickly. It reduces load on slower storage (like databases) and improves system performance." },
      { heading: "Why is Caching Important?",
        content: "• Reduces latency and improves response time\n• Reduces load on database / backend services\n• Improves throughput and scalability\n• Cost effective (fewer DB queries, less compute)\n• Improves overall user experience" },
      { heading: "Where to Use Cache?",
        table: [["Layer","What to Cache (Examples)"],
          ["Browser / Client","Static assets (JS, CSS, Images)"],
          ["CDN","Images, videos, static files, API responses"],
          ["Application Cache","Session data, user preferences, frequently read data"],
          ["Database Cache","Query results, reference data, expensive computations"],
          ["Distributed Cache","Shared cache for multiple application instances"]] },
      { heading: "Cache Eviction Policies",
        table: [["Policy","How it Works"],
          ["LRU (Least Recently Used)","Evict least recently used items first."],
          ["LFU (Least Frequently Used)","Evict least frequently used items."],
          ["FIFO (First In First Out)","Evict oldest items first."],
          ["TTL (Time To Live)","Evict items that have expired."],
          ["Random","Evict random items."]] },
      { heading: "Common Caching Strategies",
        table: [["Strategy","Description"],
          ["Cache-Aside (Lazy Loading)","App first checks cache. On miss, fetches from DB, stores in cache, then returns."],
          ["Read-Through","Cache layer sits in front of DB. On miss, cache loads from DB automatically."],
          ["Write-Through","Write goes to cache and DB at the same time. Cache always has latest data."],
          ["Write-Back (Write-Behind)","Write goes to cache first. DB is updated later (async). Faster but risk of data loss."],
          ["Refresh-Ahead","Frequently accessed data is refreshed in cache before it expires."]] },
      { heading: "Key Takeaways",
        content: "• Cache is fast memory between your app and slow storage.\n• Use the right strategy: Cache-Aside is most common.\n• Always set TTL to avoid stale data.\n• Monitor hit rate, miss rate, latency, evictions.\n• Distributed cache (Redis) for multi-server setups." },
    ]
  },
  {
    id: 6,
    title: "Databases: SQL vs NoSQL",
    sections: [
      { heading: "Types of Databases",
        content: "SQL (Relational Databases): Store data in tables (rows and columns). Have a fixed schema. Use SQL for querying.\n\nNoSQL (Non-Relational Databases): Store data in non-tabular formats. Schema is flexible or dynamic. Designed for scale and high performance." },
      { heading: "SQL vs NoSQL — Key Differences",
        table: [["Feature","SQL (Relational)","NoSQL (Non-Relational)"],
          ["Data Model","Table (rows & columns)","Key-Value, Document, Column, Graph"],
          ["Schema","Fixed (predefined)","Flexible (dynamic)"],
          ["Query Language","SQL","Different query APIs"],
          ["Joins","Supports Joins","Limited or No Joins"],
          ["Transactions","ACID Transactions","BASE (Eventual consistency)"],
          ["Scalability","Vertical Scaling","Horizontal Scaling"],
          ["Consistency","Strong Consistency","Eventual Consistency"],
          ["Examples","MySQL, PostgreSQL, Oracle","MongoDB, Cassandra, Redis, DynamoDB"],
          ["Best For","Complex relationships, transactions","Big data, high availability, real-time"]] },
      { heading: "When to Use SQL vs NoSQL",
        content: "Use SQL when:\n• Data is structured and relational\n• ACID transactions are needed\n• Complex queries and joins\n• Data consistency is critical\n• Examples: Banking system, ERP, E-commerce\n\nUse NoSQL when:\n• Data is unstructured / semi-structured\n• Need high scalability and availability\n• Handling big data and high write load\n• Flexible schema is required\n• Examples: Social media feeds, IoT data, Real-time analytics, Caching" },
      { heading: "Types of NoSQL Databases",
        table: [["Type","How it Stores","Examples"],
          ["Document Store","JSON/BSON documents","MongoDB, CouchDB"],
          ["Key-Value Store","Key → Value pairs","Redis, DynamoDB, Riak"],
          ["Column Store","Columns, optimized for large datasets","Cassandra, HBase"],
          ["Graph Database","Nodes and edges","Neo4j, Amazon Neptune"]] },
      { heading: "Real World Examples",
        table: [["Application","Better Choice","Why?"],
          ["Banking System","SQL","Needs ACID, consistency, complex transactions"],
          ["User Authentication","SQL","Relational data, strong consistency"],
          ["Social Media Feed","NoSQL (Document/Key-Value)","High write/read, flexible schema"],
          ["Real-time Analytics","NoSQL (Column Store)","High throughput, large volumes of data"],
          ["Shopping Cart","NoSQL (Key-Value)","Fast read/write, simple data access"],
          ["Content Management","NoSQL (Document Store)","Flexible content structure"]] },
    ]
  },
  {
    id: 7,
    title: "Database Scaling + Sharding",
    sections: [
      { heading: "Why Do We Need to Scale Databases?",
        content: "As data and traffic grow:\n• Single server becomes a bottleneck\n• Storage capacity is limited\n• High CPU / memory usage\n• Affects performance and availability" },
      { heading: "Ways to Scale a Database",
        table: [["Technique","Type","How it Works","Use Case"],
          ["Read Replicas","Scale Out","Copy of primary DB handles read queries","Read heavy workloads"],
          ["Partitioning","Scale Out","Split data into smaller parts across servers","Large tables, range based"],
          ["Sharding","Scale Out","Distribute data across multiple independent DBs","Very large data, high write load"],
          ["Caching","Scale Out","Store frequently accessed data in cache (Redis)","Reduce read load and latency"],
          ["Vertical Scaling","Scale Up","Increase power of existing server","Short term fix, small-medium scale"]] },
      { heading: "Sharding",
        content: "Sharding is a technique to horizontally partition data across multiple database instances (shards).\n\nKey Points:\n• Each shard contains a subset of data.\n• Shards work independently.\n• Improves scalability and write performance.\n• Adds complexity in querying and transactions." },
      { heading: "Types of Sharding",
        content: "1. Range-based (e.g., UserID 1-1000, 1001-2000)\n2. Hash-based (e.g., hash(UserID) % N)\n3. Directory-based (Lookup service maps key → shard)\n4. Geo-based (Data split by region)" },
      { heading: "Key Takeaways",
        content: "• Vertical scaling is easier but has a limit.\n• Horizontal scaling is the key to handle massive scale.\n• Sharding helps in distributing data and write load.\n• Use read replicas, caching and partitioning along with sharding for best results.\n• Scaling is not just adding servers — it requires careful design, monitoring and handling data distribution, consistency and failures." },
    ]
  },
  {
    id: 8,
    title: "Replication + Consistency",
    sections: [
      { heading: "What is Replication?",
        content: "Replication means maintaining multiple copies of the same data on different servers.\n\nWhy Replication:\n• Improves availability and fault tolerance\n• Handles read scale\n• Protects against data loss\n• Enables data to be closer to users (lower latency)" },
      { heading: "Types of Replication",
        table: [["Type","Description","Use Case"],
          ["Master-Slave (Primary-Replica)","One primary handles writes. Replicas handle reads.","Most common, simple to implement"],
          ["Master-Master (Multi-Primary)","Multiple masters accept writes. Data is synced between them.","High availability, geo-distribution"],
          ["Synchronous Replication","Write is considered successful only after replicas acknowledge.","Strong consistency required"],
          ["Asynchronous Replication","Write is considered successful after primary writes. Replicas catch up later.","High performance, eventual consistency"]] },
      { heading: "What is Consistency?",
        content: "Consistency means all users see the same data at the same time. In distributed systems, achieving consistency is hard because updates take time to propagate across replicas." },
      { heading: "Consistency Models",
        table: [["Model","Description","Example Systems"],
          ["Strong Consistency","All clients see the latest write immediately.","Traditional RDBMS (Single DB)"],
          ["Eventual Consistency","All replicas will become consistent over time.","Cassandra, DynamoDB, CouchDB"],
          ["Causal Consistency","If X happened before Y, all users see X before Y.","MongoDB (Causal), Riak"],
          ["Read-your-writes","User sees their own writes.","Most systems with session guarantees"],
          ["Linearizability","Seems like operations happen in real-time order.","Zookeeper, etcd, Spanner (strong)"]] },
      { heading: "CAP Theorem",
        content: "In distributed systems, you can have only two out of three:\n\nC (Consistency): All nodes see same data\nA (Availability): System remains available\nP (Partition Tolerance): System works despite network partitions\n\nIn real world, network partitions are unavoidable, so systems choose between Consistency and Availability.\n\nExamples:\n• RDBMS (single region): CA\n• Cassandra/DynamoDB: AP\n• MongoDB (default): AP\n• Spanner/etcd: CP" },
    ]
  },
  {
    id: 9,
    title: "CAP Theorem + Distributed Systems",
    sections: [
      { heading: "What is CAP Theorem?",
        content: "In a distributed system, you can have at most two out of the following three guarantees:\n\nC (Consistency): All nodes see the same data at the same time.\nA (Availability): Every request receives a response (no failures).\nP (Partition Tolerance): System works despite network partitions (message loss)." },
      { heading: "CAP Theorem — Possible Choices",
        table: [["Choice","Description","Example Systems"],
          ["CP","Consistency + Partition Tolerance. System remains consistent even if some nodes are unavailable. Availability is sacrificed.","HBase, MongoDB (w/ majority), Cassandra (consistency > 1), Zookeeper, Spanner"],
          ["AP","Availability + Partition Tolerance. System remains available even if some data is inconsistent. Consistency is sacrificed.","Cassandra (ONE), DynamoDB, CouchDB, Riak, Voldemort"],
          ["CA","Consistency + Availability. Only possible when there is no network partition. Partition Tolerance is sacrificed.","RDBMS (MySQL, PostgreSQL) in single region, Redis (single instance)"]] },
      { heading: "What is a Distributed System?",
        content: "A distributed system is a collection of independent computers (nodes) that appear to users as a single system.\n\nCharacteristics:\n• No shared memory\n• Nodes communicate over network\n• Concurrency of operations\n• Partial failures are possible\n• Scalability and fault tolerance" },
      { heading: "Challenges in Distributed Systems",
        content: "• Network failures and partitions\n• Node failures\n• Data consistency\n• Time synchronization\n• Concurrency control\n• Scalability\n• Security\n\nNote: Failures are normal, not exceptional! Design for failure." },
      { heading: "Real World Examples",
        table: [["System / Service","CAP Choice","Why?"],
          ["Google Spanner","CP","Strong consistency across regions is critical."],
          ["Cassandra","AP","Designed for high availability and partition tolerance. Eventual consistency."],
          ["DynamoDB","AP","High availability and low latency at scale. Offers eventual consistency options."],
          ["MongoDB","CP (default)","With majority writes, prefers consistency. Can be tuned for availability."],
          ["RDBMS (Single Region)","CA","In single data center, partitions are rare."]] },
    ]
  },
  {
    id: 10,
    title: "API Design + REST",
    sections: [
      { heading: "What is an API?",
        content: "An API (Application Programming Interface) is a set of rules that allows one application to communicate with another." },
      { heading: "What is REST?",
        content: "REST (Representational State Transfer) is an architectural style for building APIs using HTTP methods. It is simple, scalable and stateless.\n\nKey Principles: Client-Server, Stateless, Cacheable, Uniform Interface, Layered System, Code on Demand (optional)" },
      { heading: "HTTP Methods",
        table: [["Method","Purpose","Idempotent","Safe"],
          ["GET","Retrieve resource","Yes","Yes"],
          ["POST","Create resource","No","No"],
          ["PUT","Update / Replace resource","Yes","No"],
          ["PATCH","Partially update resource","No","No"],
          ["DELETE","Delete resource","Yes","No"]] },
      { heading: "REST API Example (Resource: /users)",
        table: [["Method","Endpoint","Description","Example"],
          ["GET","/users","Get all users","GET /users"],
          ["GET","/users/{id}","Get user by ID","GET /users/123"],
          ["POST","/users","Create a new user","POST /users"],
          ["PUT","/users/{id}","Update user (replace)","PUT /users/123"],
          ["PATCH","/users/{id}","Update user (partial)","PATCH /users/123"],
          ["DELETE","/users/{id}","Delete user","DELETE /users/123"]] },
      { heading: "Status Codes (Common)",
        table: [["Code Range","Code","Meaning"],
          ["2xx (Success)","200","OK — Request successful"],
          ["2xx (Success)","201","Created — Resource created"],
          ["2xx (Success)","204","No Content — Success, no content to return"],
          ["3xx (Redirection)","301","Moved Permanently"],
          ["4xx (Client Error)","400","Bad Request — Invalid request"],
          ["4xx (Client Error)","401","Unauthorized — Authentication required"],
          ["4xx (Client Error)","403","Forbidden — No permission"],
          ["4xx (Client Error)","404","Not Found — Resource not found"],
          ["4xx (Client Error)","429","Too Many Requests — Rate limit exceeded"],
          ["5xx (Server Error)","500","Internal Server Error"],
          ["5xx (Server Error)","503","Service Unavailable — Server temporarily down"]] },
      { heading: "URL Design Best Practices",
        content: "• Use nouns, not verbs → /users (not /getUsers)\n• Use plural nouns → /users\n• Use hierarchical structure → /users/123/orders/456\n• Use lowercase letters\n• Use hyphens (-) to separate words\n• Avoid file extensions → /users (not /users.json)\n• Use query parameters for filtering, sorting, pagination\n\nExamples:\n/users?role=admin&status=active&page=2&limit=20\n/orders?userId=123&sort=createdAt:desc" },
      { heading: "API Design Best Practices",
        content: "• Keep it simple and consistent\n• Use meaningful and versioned URLs (/v1/users)\n• Follow HTTP methods correctly\n• Use proper status codes\n• Support pagination, filtering, sorting\n• Implement authentication & authorization\n• Validate input and handle errors gracefully\n• Provide clear documentation\n• Ensure security (HTTPS, rate limiting, CORS)" },
    ]
  },
  {
    id: 11,
    title: "Message Queues + Event-Driven Architecture",
    sections: [
      { heading: "What is a Message Queue?",
        content: "A message queue (or messaging system) is a middleware that allows applications to send, store, and receive messages asynchronously.\n\nWhy Message Queues:\n• Decouple components and services\n• Handle traffic spikes (buffering)\n• Improve reliability & fault tolerance\n• Enable asynchronous communication\n• Build scalable, flexible systems" },
      { heading: "How Message Queues Work",
        content: "1. Producer sends a message to the queue.\n2. Queue stores the message until a consumer retrieves it.\n3. Consumer reads and processes the message.\n4. Message is acknowledged (deleted) after successful processing." },
      { heading: "Message Queue Patterns",
        table: [["Pattern","Description","Use Case"],
          ["Point-to-Point (Queue)","One message is consumed by one consumer.","Task distribution, background jobs"],
          ["Publish/Subscribe (Topic)","One message is delivered to multiple subscribers.","Notifications, real-time updates, fan-out"],
          ["Competing Consumers (Queue)","Multiple consumers compete to consume messages.","Load balancing across workers"],
          ["Request/Reply","Producer sends request and waits for reply message.","RPC style communication async"]] },
      { heading: "Event-Driven Architecture (EDA)",
        content: "In EDA, services produce events and other services react to those events. Communication happens through events.\n\nProducers don't call consumers directly. They publish events. Consumers subscribe and react to events." },
      { heading: "Popular Message Queue / Broker Systems",
        table: [["System","Type","Highlights"],
          ["RabbitMQ","Broker","Mature, reliable, rich features, routing, ack, DLQ"],
          ["Kafka","Log-based Broker","High throughput, durable, streams, replay, partitions"],
          ["Amazon SQS","Managed Queue","Fully managed, simple, scales automatically"],
          ["Google Pub/Sub","Managed Pub/Sub","Globally distributed, at-least-once delivery"],
          ["Redis Streams","Stream","Lightweight, in-memory, good for real-time"]] },
      { heading: "Key Takeaways",
        content: "• Keep messages small and focused.\n• Use meaningful event names and version them.\n• Design consumers to be idempotent.\n• Handle failures with retries and DLQ.\n• Monitor queue length, lag, failures.\n• Secure your message broker (auth, encryption)." },
    ]
  },
  {
    id: 12,
    title: "Microservices + Service Communication",
    sections: [
      { heading: "What are Microservices?",
        content: "A microservices architecture structures an application as a collection of small, independent services:\n• Each service implements a specific business capability\n• Services are independent and loosely coupled\n• Built, deployed and scaled independently\n• Communicate over a network using lightweight protocols" },
      { heading: "Benefits vs Challenges",
        table: [["Benefits","Challenges"],
          ["Independent deployment","Complex distributed system"],
          ["Technology Flexibility","Network latency & failures"],
          ["Scalability (scale what you need)","Data consistency"],
          ["Fault isolation","Monitoring & debugging"],
          ["Faster development & delivery","More DevOps & operational overhead"]] },
      { heading: "Service Communication Styles",
        table: [["Style","Description","Communication","Use Cases","Pros","Cons"],
          ["Synchronous","Services wait for immediate response","Request/Response (HTTP/gRPC)","Real-time operations, Get data, Update","Simple, Easy to understand","Coupling, Cascade failures, Latency"],
          ["Asynchronous","Services communicate via events/messages","Message Broker (Queue/Stream)","Event notifications, Background jobs","Decoupled, Resilient, Scalable","Complexity, Eventual Consistency"]] },
      { heading: "Common Communication Protocols",
        table: [["Protocol","Type","Description","Best For"],
          ["REST (HTTP/JSON)","Sync","Widely used, human readable, easy to integrate","General purpose, public APIs"],
          ["gRPC","Sync","High performance, HTTP/2, Protocol Buffers (binary)","Internal microservices communication"],
          ["GraphQL","Sync","Client asks for what it needs, reduces over/under fetching","Complex queries, client flexibility"],
          ["Messaging (Kafka, RabbitMQ, SQS)","Async","Event-based, decoupled communication","Events, notifications, background jobs"]] },
      { heading: "API Gateway",
        content: "Single entry point for clients. Handles routing, authentication, rate limiting, caching, and logging.\n\nServices behind the gateway: User Service, Order Service, Payment Service, Inventory Service." },
      { heading: "Best Practices",
        content: "• Design Around Business Capabilities\n• Keep Services Small — easier to develop, deploy and maintain\n• Independent Deployments — use CI/CD pipelines\n• Resilience — implement timeouts, retries, circuit breakers, bulkheads\n• Observability — centralized logging, metrics, tracing and monitoring\n• Security — secure service-to-service communication (mTLS), OAuth2/JWT\n• Versioning — version APIs to avoid breaking changes" },
    ]
  },
  {
    id: 13,
    title: "Storage + CDN",
    sections: [
      { heading: "Types of Storage",
        table: [["Type","What it Stores","Characteristics","Examples"],
          ["Block Storage","Raw blocks of data","Low-level, high performance, used by servers/DBs","EBS (AWS), Persistent Disk (GCP)"],
          ["File Storage","Files in a hierarchical structure","Shared access, easy to organize","EFS (AWS), Azure Files, NFS"],
          ["Object Storage","Objects (data + metadata) in buckets","Highly scalable, durable, access via API","S3 (AWS), GCS, Azure Blob"],
          ["Database Storage","Structured data in tables/documents","Optimized for queries and transactions","MySQL, PostgreSQL, MongoDB, DynamoDB"]] },
      { heading: "Object Storage",
        content: "• Unlimited scale\n• 99.999999999% durability (e.g., S3)\n• Use cases: backups, logs, images, videos, static files, ML data\n• Upload/Download via API" },
      { heading: "What is a CDN?",
        content: "A CDN (Content Delivery Network) is a distributed network of edge servers that cache and deliver content closer to users.\n\nHow CDN Works:\n1. User requests content.\n2. CDN Edge (closest server) checks if cached.\n3. If cached, serve to user.\n4. If not cached, fetch from origin server.\n5. Cache it for next time.\n\nResult: Faster delivery, lower latency, reduced load on origin server." },
      { heading: "Benefits of CDN",
        content: "• Low latency — content served from nearest edge location\n• High availability — CDN absorbs traffic spikes\n• Reduced bandwidth cost — fewer requests hit origin server\n• Better user experience — fast loading of static & dynamic content" },
      { heading: "Popular CDNs",
        table: [["CDN","Provider","Highlights"],
          ["CloudFront","AWS","Deep AWS integration, secure, global edge locations"],
          ["Cloud CDN","Google Cloud","High performance, works with GCP services"],
          ["Azure CDN","Microsoft Azure","Integration with Azure, global reach"],
          ["Fastly","Fastly","Developer friendly, real-time config, edge compute"],
          ["Cloudflare CDN","Cloudflare","Easy to use, DDoS protection, free tier"]] },
      { heading: "Storage Best Practices",
        content: "• Choose the right storage for the right data\n• Enable encryption at rest and in transit\n• Use replication / multi-AZ for durability\n• Lifecycle policies for cost optimization\n• Monitor usage, latency, errors and set alerts\n\nNote: Storage is about durability and cost. CDN is about speed and availability (closer to users). Both are critical for scalable systems." },
    ]
  },
  {
    id: 14,
    title: "Authentication + Authorization",
    sections: [
      { heading: "Authentication vs Authorization",
        table: [["","Authentication","Authorization"],
          ["Purpose","Verify identity","Verify permissions"],
          ["Question","Who are you?","What can you do?"],
          ["Done by","Auth System","App / Resource Server"],
          ["Occurs","Once (at login)","Every time (for access)"],
          ["Example","Login with password","Can user delete this post?"]] },
      { heading: "Common Authentication Methods",
        table: [["Method","Description"],
          ["Username & Password","Traditional method. Use strong password hashing (bcrypt, Argon2)."],
          ["Multi-Factor Authentication (MFA)","Add an extra factor (OTP, SMS, Authenticator app)."],
          ["OAuth 2.0 / OpenID Connect","Standard protocols for delegated authentication (Google, GitHub)."],
          ["API Keys","Simple token-based auth for service-to-service."],
          ["Biometrics","Fingerprint, Face ID, etc."]] },
      { heading: "JSON Web Token (JWT) Overview",
        content: "JWT = Header (alg, typ) + Payload (claims) + Signature (verify). Base64Url encoded.\n\nCommon Claims:\n• sub — Subject (user id)\n• iss — Issuer\n• exp — Expiry time\n• iat — Issued at\n• aud — Audience\n\nProperties:\n• Stateless: Server doesn't store session.\n• Self-contained: Contains user info (claims).\n• Signed: Prevents tampering.\n• Use HTTPS always when sending tokens." },
      { heading: "Authorization Models",
        table: [["Model","Description","Use Case"],
          ["RBAC (Role-Based Access Control)","Permissions are assigned to roles. Users get roles.","Admin, Editor, Viewer roles"],
          ["ABAC (Attribute-Based Access Control)","Access based on attributes (user, resource, action, env).","Complex rules, dynamic environments"],
          ["ACL (Access Control List)","Permissions listed for users or resources.","Simple systems, legacy apps"]] },
      { heading: "Best Practices",
        content: "• Use strong password policy (or better: passwordless + MFA).\n• Hash passwords with salt (bcrypt / Argon2).\n• Use short-lived tokens and refresh tokens.\n• Store tokens securely (HttpOnly cookies or secure storage).\n• Log authentication events and monitor suspicious activity.\n• Don't expose sensitive info in tokens.\n• Use HTTPS everywhere.\n• Validate & verify tokens on every request.\n• Enforce authorization checks (least privilege).\n• Short-lived access tokens.\n• Rate limiting & brute-force protection.\n\nRule: Never trust the client. Always verify on the server. Principle of Least Privilege is the key!" },
    ]
  },
  {
    id: 15,
    title: "Rate Limiting + Security",
    sections: [
      { heading: "What is Rate Limiting?",
        content: "Rate limiting restricts the number of requests a client can make in a given time window.\n\nWhy Rate Limiting:\n• Prevent abuse, brute force, and DoS attacks\n• Ensure fair usage of system resources\n• Protect downstream services\n• Maintain system stability & availability" },
      { heading: "Common Rate Limiting Algorithms",
        table: [["Algorithm","How it Works","Pros","Cons","Best For"],
          ["Fixed Window Counter","Count requests in fixed time window","Simple, easy to implement","Burst at window boundary","APIs, Basic usage limitation"],
          ["Sliding Log","Store timestamps of requests in a log","Accurate","High memory usage","Strict rate limits"],
          ["Sliding Window Counter","Weighted count of current + previous window","More accurate, lower memory","Slightly complex","General purpose"],
          ["Token Bucket","Tokens added at constant rate. Each request consumes a token.","Smooth traffic, allows bursts","Complex to tune","APIs, Network traffic"],
          ["Leaky Bucket","Requests queued and processed at fixed rate","Smooth outgoing traffic","Requests may be delayed","Traffic shaping"]] },
      { heading: "Where to Implement?",
        content: "1. API Gateway / Reverse Proxy (Nginx, Envoy, Kong)\n2. Application Layer\n3. Distributed Rate Limiter (Redis, Memcached)\n4. CDN / Edge (Cloudflare, AWS WAF)" },
      { heading: "Security Fundamentals (Must Have)",
        content: "Authentication: Verify identity of users (Who are you?)\nAuthorization: Verify permissions (What can you do?)\nConfidentiality: Protect data from unauthorized access\nIntegrity: Ensure data is accurate and not tampered\nAvailability: Ensure system is available when needed\nNon-repudiation: Actions should be traceable and verifiable" },
      { heading: "Common Security Threats",
        content: "• Injection Attacks (SQL, NoSQL, OS)\n• Cross Site Scripting (XSS)\n• Cross Site Request Forgery (CSRF)\n• Broken Authentication\n• Sensitive Data Exposure\n• Security Misconfiguration\n• Broken Access Control (IDOR)\n• Denial of Service (DoS / DDoS)" },
      { heading: "Security Best Practices",
        content: "• Use HTTPS everywhere\n• Validate and sanitize all inputs\n• Use parameterized queries / ORM\n• Implement proper authentication and authorization\n• Enforce least privilege access\n• Store passwords using strong hashing (bcrypt, Argon2)\n• Use secure cookies (HttpOnly, Secure, SameSite)\n• Keep dependencies and systems updated\n• Log and monitor security events\n• Backup data regularly and test restores" },
    ]
  },
  {
    id: 16,
    title: "Monitoring + Logging + Fault Tolerance",
    sections: [
      { heading: "The 3 Pillars",
        content: "Monitoring: Know what's happening (right now) — collecting and analyzing metrics in real-time.\n\nLogging: Know why it happened (historical data) — recording events that help understand what happened.\n\nFault Tolerance: Keep system running even when things fail — system continues to operate even when components fail." },
      { heading: "Types of Metrics",
        table: [["Type","What it Measures","Examples"],
          ["Infrastructure","CPU, Memory, Disk, Network","CPU %, Memory %, Disk IO, Network In/Out"],
          ["Application","Requests, Errors, Latency","RPS, Error Rate, p95 Latency"],
          ["Business","Business KPIs","Signups, Orders, Revenue"],
          ["Custom","Domain specific metrics","Cache Hit Rate, Queue Length"]] },
      { heading: "Logging Best Practices",
        content: "• Use log levels: DEBUG, INFO, WARN, ERROR\n• Include context (request id, user id, trace id)\n• Centralize logs\n• Avoid logging sensitive data\n• Set log retention & rotation\n• Create alerts on important logs\n• Good Log Characteristics: Structured (JSON), Consistent, Useful, Include Context, Centralized and searchable" },
      { heading: "Fault Tolerance Patterns",
        table: [["Pattern","Description","Use Case"],
          ["Retry","Retry failed operations","Transient errors"],
          ["Timeout","Fail fast if taking too long","Slow dependencies"],
          ["Circuit Breaker","Stop calling failing service","Prevent cascading failures"],
          ["Bulkhead","Isolate resources per component","Limit failure impact"],
          ["Fallback","Provide alternative response","Graceful degradation"],
          ["Queue / Buffer","Absorb spikes and retry later","Traffic spikes"],
          ["Idempotency","Make operations safe to retry","APIs, Payments"]] },
      { heading: "Key Monitoring Tools",
        content: "Monitoring: Prometheus, Grafana, Alertmanager, Datadog / New Relic, CloudWatch\n\nLogging: ELK Stack (Elasticsearch, Logstash, Kibana), Loki + Grafana, Fluent / Filebeat, Splunk, CloudWatch Logs\n\nFault Tolerance: Resilience4j (circuit breaker, retry, rate limiter), Hystrix (legacy), Envoy (service mesh), Kubernetes (auto restart, self-healing), AWS / GCP Services (auto scaling)" },
      { heading: "Key Takeaways",
        content: "• Monitor RED: Rate, Errors, Duration\n• Set SLOs and Alerts\n• Use dashboards for golden signals: Latency, Traffic (RPS), Errors, Saturation\n• Design for failure, not for success\n• You can't fix what you can't see\n• Failures are normal — detect fast, recover fast, minimize user impact" },
    ]
  },
  {
    id: 17,
    title: "Real-World System Design Problems",
    sections: [
      { heading: "Design Process (High Level)",
        content: "1. Understand Requirements — clarify functional & non-functional\n2. Define Goals & Constraints — scale, latency, availability\n3. High Level Design (HLD) — core components and flow\n4. Low Level Design (LLD) — deep dive into important components\n5. Scale & Optimize — make it robust, scalable and cost-effective" },
      { heading: "1. URL Shortener (like bit.ly)",
        content: "Requirements: Shorten long URLs, Redirect to original URL, Analytics (clicks, location, time), High availability, low latency.\n\nKey Components:\n• Hash function / Base62 encoding\n• SQL/NoSQL DB to store mappings\n• Cache for fast lookups\n• CDN for static assets & global access\n\nScale Strategies: Replicate DB (Read Replicas), Cache hot URLs, Sharding / Partitioning, Use CDN\n\nTech: API, DB, Redis, CDN" },
      { heading: "2. Ride Sharing (like Uber)",
        content: "Requirements: Match riders with nearby drivers, Real-time location tracking, ETA & route optimization, Payments, notifications, High availability.\n\nKey Components:\n• Geo indexing (e.g., Geohash)\n• Real-time communication (WebSocket)\n• Routing & ETA (maps, traffic)\n• Microservices architecture\n\nScale Strategies: Horizontal scaling of services, Sharding by region, Event-driven architecture, Caching & CDN for static data\n\nTech: APIs, Geo, WebSocket, Cache, DB" },
      { heading: "3. Social Media Feed (like Instagram)",
        content: "Requirements: Users can post, like, comment, Personalized feed, Support millions of users, Real-time updates.\n\nKey Components:\n• Fan-out on write / Fan-out on read\n• Store feed in DB / Cache\n• Pagination for feed\n• Media via CDN\n• Real-time updates\n\nScale Strategies: Sharding (by user id), Pagination & lazy loading, CDN for media, Asynchronous processing\n\nTech: DB, Cache, CDN" },
      { heading: "4. Video Streaming (like YouTube)",
        content: "Requirements: Upload & store videos, Stream with low buffering, Support different resolutions, Global availability.\n\nKey Components:\n• Upload to object storage\n• Transcode to multiple resolutions\n• CDN for fast delivery\n• Metadata in DB\n\nScale Strategies: Chunked upload, Parallel transcoding, Multi-CDN, DB sharding\n\nTech: S3, CDN, Transcoding, DB" },
      { heading: "5. E-commerce System",
        content: "Requirements: Browse products, search, Add to cart, place order, Payments, order tracking, High availability & consistency.\n\nKey Components:\n• Microservices architecture\n• Inventory management\n• Reliable payments\n• Search & recommendations\n\nScale Strategies: DB replication & sharding, Cache product/catalog data, Async processing (queues), Auto-scaling services\n\nTech: Microservices, DB, Cache, Search" },
      { heading: "6. Chat Application (like WhatsApp)",
        content: "Requirements: Real-time messaging, Online status, typing, Deliver messages reliably, Support millions of users.\n\nKey Components:\n• WebSocket for real-time\n• Message queue for reliability\n• NoSQL DB for messages\n• Presence & typing indicators\n\nScale Strategies: Partition shards (by room id), Horizontal scaling, Multi-region deployment, Store & forward for offline\n\nTech: WebSocket, MQ, DB, Cache" },
      { heading: "Common Data Stores",
        table: [["Store","Type","Best For","Examples"],
          ["SQL DB","Relational","Transactions, consistency","MySQL, PostgreSQL"],
          ["NoSQL DB","Document / Column / Key-Value","Large scale, flexible schema","MongoDB, Cassandra, DynamoDB"],
          ["Cache","In-Memory","Fast access, session, counters","Redis, Memcached"],
          ["Object Storage","Blob Storage","Files, images, videos","S3, GCS, Azure Blob"],
          ["Search Engine","Full text search","Product search, log search","Elasticsearch, OpenSearch"],
          ["Queue / Stream","Messaging","Async processing","Kafka, RabbitMQ, SQS"]] },
    ]
  },
  {
    id: 18,
    title: "System Design Interview Questions",
    sections: [
      { heading: "How to Approach Any System Design Question",
        content: "1. Clarify Requirements — Ask questions. Understand the problem deeply.\n2. Define Goals & Constraints — Functional + Non-functional requirements.\n3. High Level Design (HLD) — Core components and flow.\n4. Low Level Design (LLD) — Deep dive into important components.\n5. Scale, Optimize & Trade-offs — Make it robust, scalable and cost-effective." },
      { heading: "Common Non-Functional Requirements",
        content: "• Scalability (to millions / billions)\n• High Availability (99.9% or more)\n• Low Latency\n• Fault Tolerance\n• Consistency\n• Security\n• Cost Effective\n• Maintainability" },
      { heading: "More Common Interview Questions",
        table: [["#","Question","One-Line High Level Answer"],
          ["7","Design Netflix / OTT Platform","Video upload, transcode, store, CDN delivery, recommendations."],
          ["8","Design a Payment System (like PayPal)","Payment flow, fraud check, transaction DB, settlement."],
          ["9","Design a Notification System","Message queue, templates, delivery channels, retry logic."],
          ["10","Design a Search Engine (like Google Search)","Crawling, indexing, ranking, search API, caching."],
          ["11","Design a Rate Limiter","Token bucket / leaky bucket, Redis, API Gateway."],
          ["12","Design a Distributed File Storage System (like Dropbox)","Chunking, replication, metadata store, versioning."],
          ["13","Design a Leaderboard System","Store scores, rank using sorted set, caching."],
          ["14","Design a News Aggregator (like Flipboard)","Fetch from multiple sources, rank, cache, personalize."],
          ["15","Design an IoT Data Ingestion System","Device data ingestion, stream processing, storage, analytics."]] },
      { heading: "Things Interviewers Look For",
        content: "• Problem solving approach\n• Ability to clarify requirements\n• Understanding of trade-offs\n• Knowledge of distributed systems\n• Ability to scale the design\n• Communication and structured thinking" },
      { heading: "Pro Tips",
        content: "• Use diagrams.\n• Start simple, then add scale.\n• Communicate & clarify requirements.\n• Use the right components for the job.\n• Discuss trade-offs & assumptions.\n• Always think about failure & retry.\n• Monitor, log and secure everything.\n• Design for the future, not just today.\n• There is no single 'right' design." },
      { heading: "Quick Checklist Before You Design",
        content: "□ Have I clarified the requirements?\n□ Have I defined goals & constraints?\n□ Have I thought about scale (users, data, traffic)?\n□ Have I considered availability & reliability?\n□ Have I thought about consistency?\n□ Have I considered security?\n□ Have I thought about cost?\n□ Have I considered maintainability?" },
    ]
  },
];

function TopicCard({ topic }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(() =>
    JSON.parse(localStorage.getItem("sd_read") || "[]").includes(topic.id)
  );

  function toggleRead(e) {
    e.stopPropagation();
    setRead(prev => {
      const stored = JSON.parse(localStorage.getItem("sd_read") || "[]");
      const next = prev ? stored.filter(x => x !== topic.id) : [...stored, topic.id];
      localStorage.setItem("sd_read", JSON.stringify(next));
      return !prev;
    });
  }

  return (
    <div className="corecs-card" style={{ borderLeft: read ? "2px solid var(--success)" : undefined }}>
      <button className="corecs-card-header" onClick={() => setOpen(v => !v)}>
        <span className="corecs-card-num">{String(topic.id).padStart(2, "0")}</span>
        <span className="corecs-card-q">{topic.title}</span>
        <button className={`corecs-mastered-btn${read ? " on" : ""}`} onClick={toggleRead} title={read ? "Mark unread" : "Mark read"}>✓</button>
        <span className="corecs-chevron" style={{ transform: open ? "rotate(180deg)" : undefined }}>▾</span>
      </button>
      <div className="corecs-card-body" style={{ display: open ? "block" : "none" }}>
        {topic.sections.map((sec, si) => (
          <div key={si} style={{ marginTop: si === 0 ? 12 : 20 }}>
            <p className="corecs-answer-label">{sec.heading}</p>
            {sec.content && (
              <p className="corecs-answer-text">
                {sec.content.split("\n\n").map((para, i, arr) => (
                  <span key={i}>
                    {para.split("\n").map((line, j, lines) => (
                      <span key={j}>{line}{j < lines.length - 1 && <br />}</span>
                    ))}
                    {i < arr.length - 1 && <><br /><br /></>}
                  </span>
                ))}
              </p>
            )}
            {sec.table && (
              <div style={{ overflowX: "auto" }}>
                <table className="corecs-table">
                  <thead><tr>{sec.table[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                  <tbody>{sec.table.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SystemDesignPage() {
  const readIds = JSON.parse(localStorage.getItem("sd_read") || "[]");
  const readCount = readIds.length;
  const pct = Math.round((readCount / TOPICS.length) * 100);

  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">SYSTEM DESIGN COURSE</p>
          <h1>System Design — Complete Notes</h1>
          <p>{TOPICS.length} topics from requirements to real-world problems. Mark topics as read to track progress.</p>
        </div>
        <MonitorCog size={24} />
      </div>

      {/* Stats + PDF download */}
      <div className="corecs-stats" style={{ marginBottom: 20 }}>
        <div className="corecs-stat"><strong>{TOPICS.length}</strong><span>Topics</span></div>
        <div className="corecs-stat"><strong style={{ color: "var(--success)" }}>{readCount}</strong><span>Read</span></div>
        <div className="corecs-stat"><strong style={{ color: "var(--accent)" }}>{pct}%</strong><span>Progress</span></div>
        <div className="corecs-progress-track"><div className="corecs-progress-fill" style={{ width: `${pct}%` }} /></div>
        <a
          href="/system_design_notes.pdf"
          download="system_design_notes.pdf"
          className="sd-pdf-btn"
          title="Download PDF notes"
        >
          <Download size={14} />
          PDF
        </a>
      </div>

      <div className="corecs-list">
        {TOPICS.map(topic => <TopicCard key={topic.id} topic={topic} />)}
      </div>
    </div>
  );
}
