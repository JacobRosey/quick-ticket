CREATE TABLE Users (
	user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(24) NOT NULL UNIQUE,
    user_hash VARCHAR(18) NOT NULL,
    tickets_opened INT NOT NULL DEFAULT 0, 
    tickets_closed INT NOT NULL DEFAULT 0,
    is_admin BIT(1) NOT NULL DEFAULT 0
)ENGINE=INNODB;

CREATE TABLE Teams (
	team_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(24) NOT NULL,
    team_code VARCHAR (14) NOT NULL
)ENGINE=INNODB;

CREATE TABLE Tickets (
	ticket_id INT NOT NULL AUTO_INCREMENT,
    team_id INT NOT NULL,
    INDEX `idx_team`(team_id),
    CONSTRAINT `fk_admin_team` FOREIGN KEY (team_id)
    REFERENCES Teams(team_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY (ticket_id),
    ticket_title VARCHAR (100) NOT NULL,
	ticket_status BIT(4) NOT NULL,
	opened_by VARCHAR(30)NOT NULL,
	closed_by VARCHAR(30),
	ticket_holder VARCHAR(30),
    creation_date TIMESTAMP NOT NULL
)ENGINE=INNODB;

CREATE TABLE Ticket_Data (
	ticket_id INT NOT NULL,
	INDEX `idx_ticket`(ticket_id),
    CONSTRAINT `fk_ticket_data` FOREIGN KEY (ticket_id)
    REFERENCES Tickets(ticket_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ticket_desc VARCHAR(4000) NOT NULL DEFAULT "No description was given",
    img_path VARCHAR(200) DEFAULT NULL,
    PRIMARY KEY (ticket_id)
)ENGINE=INNODB;

CREATE TABLE Members (
	member_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    INDEX `idx_member_user`(user_id),
    CONSTRAINT `fk_member_user` FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    team_id INT NOT NULL,
    INDEX `idx_team_member`(team_id),
    CONSTRAINT `fk_member_team` FOREIGN KEY (team_id)
    REFERENCES Teams(team_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY (member_id)
    
)ENGINE=INNODB;

CREATE TABLE Admins (
	admin_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    INDEX `idx_user`(user_id),
    CONSTRAINT `fk_admin_user` FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    team_id INT NOT NULL,
    INDEX `idx_team`(team_id),
    CONSTRAINT `fk_admin_team` FOREIGN KEY (team_id)
    REFERENCES Teams(team_id) ON UPDATE CASCADE ON DELETE RESTRICT
)ENGINE=INNODB;