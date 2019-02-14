## Installation

Dependencies:
    GIT Install
        UBUNTU
        sudo apt-get update
        sudo apt-get install git

    NodeJS Install
        UBUNTU
        sudo apt-get update
        curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
        sudo apt-get install -y nodejs

     PM2 Install
        UBUNTU
        sudo npm install -g pm2   
  
          
    RABBITMQ Install 

        UBUNTU
        Step1 - Install Erlang
            wget https://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb

            sudo dpkg -i erlang-solutions_1.0_all.deb

            sudo apt-get update

            sudo apt-get install erlang erlang-nox

        Step 2 - Install RabbitMQ Server

            import rabbitmq signing key on your system. Use the following commands to do this.

            echo 'deb http://www.rabbitmq.com/debian/ testing main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list

            wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add - rabbitmq-release-signing-key.asc

            //wget http://www.rabbitmq.com/rabbitmq-signing-key-public.asc
            //sudo apt-key add rabbitmq-signing-key-public.asc

            sudo apt-get update

            sudo apt-get install rabbitmq-server

            update /etc/hosts with server name (127.0.0.1 servername)

        Step 3 - Manage RabbitMQ Service

            sudo update-rc.d rabbitmq-server defaults

            sudo service rabbitmq-server start

            sudo service rabbitmq-server stop

            sudo vi /usr/lib/rabbitmq/bin/rabbitmq-defaults -update file location

        Step 4 – Create Admin User in RabbitMQ

            By default rabbitmq creates a user named “guest” with password “guest”. You can also create your own administrator account on RabbitMQ server using following commands. Change password with your own password.

            sudo rabbitmqctl add_user admin hv_rabbitmq_100%Pur3 

            sudo rabbitmqctl set_user_tags admin administrator

            sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

        Step 5 – Setup RabbitMQ Web Management Console



            sudo rabbitmq-plugins enable rabbitmq_management

            RabbitMQ dashboard starts on port 15672. Access your server on the port to get dashboard. Use the username and password created in step 4


        UPDATE FILE LOCATIONS:
        
            sudo vi /usr/lib/rabbitmq/bin/rabbitmq-defaults

            file locations:
                /var/log/rabbitmq/startup_\

            Increase File Descriptors
                sudo vi /etc/default/rabbitmq-server  
                 ulimit -n 65536


                 rabbitmqadmin -f tsv -q list queues name > q.txt
                 while read -r name; do rabbitmqadmin -q delete queue name="${name}"; done < q.txt




## Software Setup

Clone repository to a directory.

Create a results directory to store local file results from the scraping process.  The results directory should contain json, img, and download subdirectories.

Create a log file directory.

Update start.config.js 

    Update with appropriate directory locations for log files and results in the :
        
       
    Update the cwd element for each application section with the appropriate path where the application resides.
        
       

    Update the MQ_ADDRESS elements for each applicaiton with the appropriate mq endpoints
    
       
    Update Port element for the  name: 'harvest_api' application config:
       

Start The application:
    sudo pm2 start <location of program>/start.config.js --env production

Stop the application:
    sudo pm2 stop  <location of program>/start.config.js

    
## API Reference





