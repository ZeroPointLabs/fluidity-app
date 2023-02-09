package main_test

import (
	"math/big"
	"math/rand"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/fluidity-money/fluidity-app/common/ethereum"
	"github.com/fluidity-money/fluidity-app/lib/databases/postgres/worker"
	"github.com/fluidity-money/fluidity-app/lib/queue"
	"github.com/fluidity-money/fluidity-app/lib/types/applications"
	ethTypes "github.com/fluidity-money/fluidity-app/lib/types/ethereum"
	"github.com/fluidity-money/fluidity-app/lib/types/misc"
	"github.com/fluidity-money/fluidity-app/lib/types/network"
	token_details "github.com/fluidity-money/fluidity-app/lib/types/token-details"
	workerTypes "github.com/fluidity-money/fluidity-app/lib/types/worker"
	"github.com/fluidity-money/fluidity-app/lib/util"
	"github.com/fluidity-money/fluidity-app/tests/pipeline/libtest"
	"github.com/stretchr/testify/assert"
)

const (
	// EnvRewardsAmqpQueueName is the queue the spooler receives winners from
	EnvRewardsAmqpQueueName = `FLU_ETHEREUM_WINNERS_AMQP_QUEUE_NAME`

	// EnvPublishAmqpQueueName is the queue the spooler posts batched winners down
	EnvPublishAmqpQueueName = `FLU_ETHEREUM_BATCHED_WINNERS_AMQP_QUEUE_NAME`
)

var (
    Network = network.NetworkEthereum
    OneInt = big.NewInt(1)
)

type winnerGenerator struct {
    network network.BlockchainNetwork
    blockNumber *big.Int
    token token_details.TokenDetails
}

func (w *winnerGenerator) generateWinnerAnnouncement(from, to ethTypes.Address, fromWin, toWin map[applications.UtilityName]workerTypes.Payout) workerTypes.EthereumWinnerAnnouncement {
    w.blockNumber.Add(w.blockNumber, OneInt)

    blockNum := new(big.Int).Set(w.blockNumber)
    blockNumInt := misc.NewBigIntFromInt(*blockNum)

    return workerTypes.EthereumWinnerAnnouncement{
    	Network:         w.network,
    	TransactionHash: randomHash(),
    	BlockNumber:     &blockNumInt,
    	FromAddress:     from,
    	ToAddress:       to,
    	FromWinAmount:   fromWin,
    	ToWinAmount:     toWin,
    	TokenDetails:    w.token,
    	Application:     0,
    }
}

func generateWinnings(token token_details.TokenDetails, usd float64, exchangeRate *big.Rat) workerTypes.Payout {
    return workerTypes.Payout{
    	Native: misc.BigInt{},
    	Usd:    usd,
    }
}

func randomHash() ethTypes.Hash {
    hash := common.Hash{}

    rand.Read(hash[:])

    return ethereum.ConvertGethHash(hash)
}

func randomAddress() ethTypes.Address {
    address := common.Address{}

    rand.Read(address[:])

    return ethereum.ConvertGethAddress(address)
}

func TestSpooler(t *testing.T) {
    var (
        spoolerInputQueue   = util.GetEnvOrFatal(EnvRewardsAmqpQueueName)
        spoolerPublishQueue = util.GetEnvOrFatal(EnvPublishAmqpQueueName)
    )

    logger := libtest.LogMessages(spoolerPublishQueue)

    var (
        config = worker.GetWorkerConfigEthereum(Network)

        instantRewardThreshold = config.SpoolerInstantRewardThreshold
        //batchRewardThreshold   = config.SpoolerBatchedRewardThreshold

    )

    token := token_details.New("fTest", 6)

    generator := winnerGenerator{
    	network:     Network,
    	blockNumber: big.NewInt(10),
    	token: token,
    }

    var (
        from = randomAddress()
        to   = randomAddress()

        // 80%
        fromWinnings = generateWinnings(token, instantRewardThreshold, big.NewRat(1, 1))
        // 20%
        toWinnings = generateWinnings(token, instantRewardThreshold/4, big.NewRat(1, 1))

        fromWinningsMap = map[applications.UtilityName]workerTypes.Payout{
            applications.UtilityFluid: fromWinnings,
        }
        toWinningsMap = map[applications.UtilityName]workerTypes.Payout{
            applications.UtilityFluid: toWinnings,
        }
    )

    winning := generator.generateWinnerAnnouncement(
        from,
        to,
        fromWinningsMap,
        toWinningsMap,
    )
    winnings := []workerTypes.EthereumWinnerAnnouncement { winning }

    // this should result in an instant payout
    queue.SendMessage(spoolerInputQueue, winnings)

    var spooledWinnings workerTypes.EthereumSpooledRewards

    err := logger.GetMessage(&spooledWinnings)

    assert.Nil(t, err)

    assert.Equal(t, spooledWinnings.Network, Network)
    assert.Equal(t, spooledWinnings.Token, token)
    assert.Equal(t, spooledWinnings.FirstBlock, winning.BlockNumber)
    assert.Equal(t, spooledWinnings.LastBlock, winning.BlockNumber)

    assert.Equal(t, len(spooledWinnings.Rewards), 1)
    fluidReward, exists := spooledWinnings.Rewards[applications.UtilityFluid]
    assert.Equal(t, exists, true)
    assert.Equal(t, len(fluidReward), 2)

    fromReward := fluidReward[from]
    toReward := fluidReward[to]

    assert.Equal(t, fromReward, fromWinnings)
    assert.Equal(t, toReward, toWinnings)
}
