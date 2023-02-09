package libtest

import (
	"fmt"
	"time"

	"github.com/fluidity-money/fluidity-app/lib/queue"
)

type Logger struct {
    topic string
    msgChan chan(queue.Message)
}

const (
    DefaultTimeout = 5
)

func (r *Logger) GetMessage(into interface{}) error {
    select {
    case msg := <-r.msgChan:
        msg.Decode(into)
        return nil

    case <-time.After(time.Second * DefaultTimeout):
        return fmt.Errorf("No message after waiting %d seconds!", DefaultTimeout)
    }
}

func LogMessages(topic string) Logger {
    receiver := Logger{
        topic: topic,
    	msgChan: make(chan queue.Message),
    }

    go queue.GetMessages(topic, func(m queue.Message) {
        receiver.msgChan <- m
    })

    return receiver
}
