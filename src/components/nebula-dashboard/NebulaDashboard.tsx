import { Container, Paper, Grid, MenuItem, Select, Input, TextField } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useNebula, ClusterList, ClusterState, ClusterInfo, NativeToken, Token } from 'hooks/useNebula';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export interface Cluster {
    cluster_info: ClusterInfo,
    cluster_addr: string,
}

export function NebulaDashboard() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();
    const { getClusterList, getClusterState, getClusterInfo, getTarget } = useNebula(network.contracts.nebulaFactory);

    const [clusters, setClusters] = useState<Cluster[]>();
    const [selectedCluster, setSelectedCluster] = useState<Cluster>();
    const [clusterState, setClusterState] = useState<ClusterState>();
    const [imbalance, setImbalance] = useState<number>();
    const [separateImbalances, setSeparateImbalances] = useState<number[]>();
    const [amountsToUse, setAmountsToUse] = useState<number[]>();
    
    useEffect(() => {
        getAllClusters().then()
    }, [wallet, network])

    useEffect(() => {
        if(selectedCluster) {
            getStateForCluster(selectedCluster.cluster_addr).then()
        }
    }, [selectedCluster]) 

    const getAllClusters = async () => {
        getClusterList().then(async data => {
            const clusterPromises: Promise<Cluster>[] = [];
            data.contract_infos.forEach((contract: [active: any, contract_addr: string]) => {
                if(contract[1]) {
                    clusterPromises.push(getInfoForCluster(contract[0]));
                }
            });
            Promise.all(clusterPromises).then(c => {
                setClusters(c);
                setSelectedCluster(c[0]);
            })
        })
    }

    const getInfoForCluster = async (clusterAddress: string): Promise<Cluster> => {
        return {
            cluster_info: await getClusterInfo(clusterAddress),
            cluster_addr: clusterAddress
        }
    }

    const getStateForCluster = async (clusterAddress: string) => {
        getClusterState(clusterAddress).then(data => {
            setClusterState(data);
            console.log(data)
            setImbalance(getNotionalImbalance(data.inv.map(n => Number(n)), data.target.map(target => Number(target.amount)), data.prices.map(p => Number(p))));
            setSeparateImbalances(getSeparateImbalances(data.inv.map(n => Number(n)), data.target.map(target => Number(target.amount)), data.prices.map(p => Number(p))));
        });
    }

    const handleChange = (e: any) => {
        setSelectedCluster(clusters?.find(cluster => cluster.cluster_info.name == e.target.value) as Cluster);
    }

    const onTextChange = (e: any) => {

    }

    const addVector = (a: number[], b: number[]) => {
        return a.map((e, i) => e + b[i])
    }

    const subtractVector = (a: number[], b: number[]) => {
        return a.map((e, i) => e - b[i]);
    }

    const sum = (a: number[]) => {
        return a.reduce((m, n) => m + n);
    }

    const absolute = (a: number[]) => {
        return a.map(e => {
            if(e<0) {
                return -e;
            } else{
                return e;
            }
        });
    }

    const elementWiseMultiplication = (a: number[], b: number[]) => {
        return a.map((e, i) => e * b[i]);
    }

    const dotProduct = (a: number[], b: number[]) => {
        return a.map((e, i) => e * b[i]).reduce((i, j) => i + j);
    }

    const divideByScalar = (a: number[], b: number) => {
        return a.map(e => e / b);
    }

    const multiplyByScalar = (a: number[], b: number) => {
        return a.map(e => e * b);
    }

    const getCapitalAllocation = (i: number[], p: number[]) => {
        return elementWiseMultiplication(i, p);
    }

    const getTargetCapitalAllocation = (i: number[], w: number[], p: number[]) => {
        return multiplyByScalar(divideByScalar(elementWiseMultiplication(w, p), dotProduct(w, p)), dotProduct(i, p));
    }

    const getNotionalImbalance = (i: number[], w: number[], p: number[]) => {
        return sum(absolute(subtractVector(getTargetCapitalAllocation(i, w, p), getCapitalAllocation(i, p))));
    }

    const getSeparateImbalances = (i: number[], w: number[], p: number[]) => {
        return subtractVector(getTargetCapitalAllocation(i, w, p), getCapitalAllocation(i, p));
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Select
                value={selectedCluster ? selectedCluster?.cluster_info.name : ""}
                onChange={handleChange}
            >
                {
                    clusters?.map(info => {
                        return (
                            <MenuItem key={info.cluster_info.name} value={info.cluster_info.name}>
                                {info.cluster_info.name}
                            </MenuItem>
                        );
                    })
                }
            </Select>
            <TextField
                id="filled-number"
                label="Bid amount (UST)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    min: 0,
                    max: 10000000000
                }}
                onChange={onTextChange}
                // value={0}
                variant="filled"
            />
            <p>{selectedCluster?.cluster_addr}</p>
            <p>{selectedCluster?.cluster_info.name}</p>
            <p>{selectedCluster?.cluster_info.description}</p>
            <p>Target: </p>
            <div>{clusterState?.target.map(target => {
                return (<p key={target.amount}>{target.amount}</p>)
            })}</div>
            <div>Inventory:</div>
            <div>{clusterState?.inv.map(i => {
                return (<p key={i}>{i}</p>)
            })}</div>
            <div>Prices:</div>
            <div>{clusterState?.prices.map(p => {
                return (<p key={p}>{p}</p>)
            })}</div>

            <p>Imbalance: {imbalance}</p>
            <div>Imbalances:</div>
            <div>{separateImbalances?.map(i =>
                {
                    return (<p>{i/1_000_000}</p>)
                }
            )}</div>
            <div>Assets:</div>
            <div>{clusterState?.target.map(target => {
                return (<p key="hello">{Object.keys(target.info)[0] == "native_token"? (target.info as NativeToken).native_token.denom:(target.info as Token).token.contract_addr}</p>)
            })}</div>
        </Container>
    );
  }
