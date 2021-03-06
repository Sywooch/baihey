<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/18
 * Time: 10:51
 */

namespace console\controllers;

error_reporting( E_ERROR );

use common\models\Message;
use yii\console\Controller;

class ServerSocketController extends Controller {

    public $sockets;
    public $users;
    public $master;
    public $client;

    private $sda = [ ];//已接收的数据
    private $slen = [ ];//数据总长度
    private $sjen = [ ];//接收数据的长度
    private $ar = [ ];//加密key
    private $n = [ ];
    private $address = '120.76.84.162';
//    private $address = '192.168.0.102';
    private $port = 8080;

    public function actionRun() {
        $this->master  = $this->WebSocket( $this->address , $this->port );
        $this->sockets = [ $this->master ];

        while ( true ) {
            $changes = $this->sockets;
            $write   = null;
            $except  = null;
            socket_select( $changes , $write , $except , null );
            foreach ( $changes as $sock ) {
                if ( $sock == $this->master ) {
                    $this->client        = socket_accept( $this->master );
                    $key                 = uniqid();
                    $this->sockets[]     = $this->client;
                    $this->users[ $key ] = [
                        'socket' => $this->client ,
                        'shou'   => false
                    ];
                } else {
                    $buffer = '';
                    $len    = socket_recv( $sock , $buf , 2048 , 0 );
                    $buffer .= $buf;
                    $k = $this->search( $sock );
                    if ( $len < 7 ) {
                        $this->send2( $k );
                        continue;
                    }
                    if ( ! $this->users[ $k ]['shou'] ) {
                        $this->woshou( $k , $buffer );
                    } else {
                        $buffer = $this->uncode( $buffer , $k );
                        if ( $buffer == false ) {
                            continue;
                        }
                        $this->send( $k , $buffer );
                    }
                }
            }

        }
    }

    function close( $k ,$ming='') {
        socket_close( $this->users[ $k ]['socket'] );
        unset( $this->users[ $k ] );
        $this->sockets = [ $this->master ];
        foreach ( $this->users as $v ) {
            $this->sockets[] = $v['socket'];
        }
        $this->e( "user:$ming offline" );
    }

    function search( $sock ) {
        foreach ( $this->users as $k => $v ) {
            if ( $sock == $v['socket'] ) {
                return $k;
            }
        }

        return false;
    }

    function WebSocket( $address , $port ) {
        $server = socket_create( AF_INET , SOCK_STREAM , SOL_TCP );
        socket_set_option( $server , SOL_SOCKET , SO_REUSEADDR , 1 );
        socket_bind( $server , $address , $port );
        socket_listen( $server );
        $this->e( 'Server Started : ' . date( 'Y-m-d H:i:s' ) );
        $this->e( 'Listening on   : ' . $address . ' port ' . $port );

        return $server;
    }


    function woshou( $k , $buffer ) {
        $buf = substr( $buffer , strpos( $buffer , 'Sec-WebSocket-Key:' ) + 18 );
        $key = trim( substr( $buf , 0 , strpos( $buf , "\r\n" ) ) );

        $new_key = base64_encode( sha1( $key . "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" , true ) );

        $new_message = "HTTP/1.1 101 Switching Protocols\r\n";
        $new_message .= "Upgrade: websocket\r\n";
        $new_message .= "Sec-WebSocket-Version: 13\r\n";
        $new_message .= "Connection: Upgrade\r\n";
        $new_message .= "Sec-WebSocket-Accept: " . $new_key . "\r\n\r\n";

        socket_write( $this->users[ $k ]['socket'] , $new_message , strlen( $new_message ) );
        $this->users[ $k ]['shou'] = true;

        return true;

    }

    function uncode( $str , $key ) {
        $mask = [ ];
        $data = '';
        $msg  = unpack( 'H*' , $str );
        $head = substr( $msg[1] , 0 , 2 );
        if ( $head == '81' && ! isset( $this->slen[ $key ] ) ) {
            $len = substr( $msg[1] , 2 , 2 );
            $len = hexdec( $len );
            if ( substr( $msg[1] , 2 , 2 ) == 'fe' ) {
                $len    = substr( $msg[1] , 4 , 4 );
                $len    = hexdec( $len );
                $msg[1] = substr( $msg[1] , 4 );
            } else if ( substr( $msg[1] , 2 , 2 ) == 'ff' ) {
                $len    = substr( $msg[1] , 4 , 16 );
                $len    = hexdec( $len );
                $msg[1] = substr( $msg[1] , 16 );
            }
            $mask[] = hexdec( substr( $msg[1] , 4 , 2 ) );
            $mask[] = hexdec( substr( $msg[1] , 6 , 2 ) );
            $mask[] = hexdec( substr( $msg[1] , 8 , 2 ) );
            $mask[] = hexdec( substr( $msg[1] , 10 , 2 ) );
            $s      = 12;
            $n      = 0;
        } else if ( $this->slen[ $key ] > 0 ) {
            $len  = $this->slen[ $key ];
            $mask = $this->ar[ $key ];
            $n    = $this->n[ $key ];
            $s    = 0;
        }

        $e = strlen( $msg[1] ) - 2;
        for ( $i = $s ; $i <= $e ; $i += 2 ) {
            $data .= chr( $mask[ $n % 4 ] ^ hexdec( substr( $msg[1] , $i , 2 ) ) );
            $n ++;
        }
        $dlen = strlen( $data );

        if ( $len > 255 && $len > $dlen + intval( $this->sjen[ $key ] ) ) {
            $this->ar[ $key ]   = $mask;
            $this->slen[ $key ] = $len;
            $this->sjen[ $key ] = $dlen + intval( $this->sjen[ $key ] );
            $this->sda[ $key ]  = $this->sda[ $key ] . $data;
            $this->n[ $key ]    = $n;

            return false;
        } else {
            unset( $this->ar[ $key ] , $this->slen[ $key ] , $this->sjen[ $key ] , $this->n[ $key ] );

            $data = isset( $this->sda[ $key ] ) ? $this->sda[ $key ] . $data : $data;

            unset( $this->sda[ $key ] );

            return $data;
        }

    }


    function code( $msg ) {
        $frame    = [ ];
        $frame[0] = '81';
        $len      = strlen( $msg );
        if ( $len < 126 ) {
            $frame[1] = $len < 16 ? '0' . dechex( $len ) : dechex( $len );
        } else if ( $len < 65025 ) {
            $s        = dechex( $len );
            $frame[1] = '7e' . str_repeat( '0' , 4 - strlen( $s ) ) . $s;
        } else {
            $s        = dechex( $len );
            $frame[1] = '7f' . str_repeat( '0' , 16 - strlen( $s ) ) . $s;
        }
        $frame[2] = $this->ord_hex( $msg );
        $data     = implode( '' , $frame );

        return pack( "H*" , $data );
    }

    function ord_hex( $data ) {
        $msg = '';
        $l   = strlen( $data );
        for ( $i = 0 ; $i < $l ; $i ++ ) {
            $msg .= dechex( ord( $data{$i} ) );
        }

        return $msg;
    }

    //用户加入
    function send( $k , $msg ) {
        parse_str( $msg , $g );
        $ar = [ ];
        if ( isset( $g['type'] ) && $g['type'] == 'add' ) {
            foreach ($this->users as $kk=>$vv){
                if ($vv['name'] == $g['ming']){ // 如果已经加入，关闭已经加入的链接
                    $this->close($kk , $g['ming']);
                }
            }
            $this->e( "user:{$g['ming']} online" );

            $this->users[ $k ]['name'] = $g['ming'];
            $ar['type']                = 'add';
            $ar['name']                = $g['ming'];
            $key                       = 'all';
        } else {
            $ar['type'] = isset($g['type']) ? $g['type'] : 'send';
            if ($g['message'] == 'heartbeat') return 'heart is nothing';
            $ar['message'] = $g['message'];
            if ( $ar['message'] == null ) {
                return;
            }
            $ar['sendId'] = $g['sendId'];
            $ar['time'] = $g['time'];
            $key = $g['receiveId'];
        }
        $this->send1( $k , $ar , $key );
    }

    function getusers( $currentName ) {
        $ar = [ ];
        foreach ( $this->users as $k => $v ) {
            $ar[] = [ 'code' => $k , 'name' => $v['name'] ];
        }

        return $ar;
    }

    //$k 发信息人的code $key接受人的 code
    function send1( $k , $ar , $key = 'all' ) {

        $ar['sendName'] = $key;
        $ar['code']     = $k;
        $str            = $this->code( json_encode( $ar ) );
        if ( $key == 'all' ) {
            $users = $this->users;
            if ( $ar['type'] == 'add' ) {
                $ar['type']  = 'madd';
                $ar['users'] = $this->getusers( $ar['name'] );
                $str1        = $this->code( json_encode( $ar ) );
                socket_write( $users[ $k ]['socket'] , $str1 , strlen( $str1 ) );
                unset( $users[ $k ] );
            }
            foreach ( $users as $v ) {
                socket_write( $v['socket'] , $str , strlen( $str ) );
            }
        } else {
            if ($ar['type'] ==  'send'){
                $type = 1;
            }else if($ar['type'] ==  'record'){
                $type = 2;
            }else if ($ar['type'] ==  'pic'){
                $type = 3;
            }else if ($ar['type'] ==  'bribery'){
                $type = 4;
            }
            // 写入数据库
            $ar['send_user_id'] = $ar['sendId'];
            $str        = $this->code( json_encode( $ar ) );
            $key_code        = $this->getReceived( $key );

            if ( $this->users[ $key_code ]['socket'] != null ) {
                // 发送给别人
                socket_write( $this->users[ $key_code ]['socket'] , $str , strlen( $str ) );
                $this->e( $str . " messages is send\n" );
                $status = 1;
            } else {
                $status = 2;
                $this->e( $str . " user is not online\n" ); // 这里直接写数据库
            }
            // 发送给自己
            $ar ['status'] = $status;
            $str        = $this->code( json_encode( $ar ) );
            socket_write( $this->users[ $k ]['socket'] , $str , strlen( $str ) );

            // 消息记录数据库
            (new Message())->add($ar['sendId'],$ar['sendName'] , $ar['message'] , $type , $status);


        }
    }

    function getReceived( $name ) {
        foreach ( $this->users as $k => $v ) {
            if ( $v['name'] == $name ) {
                return $k;
            }
        }

        return false;
    }


    //用户退出
    function send2( $k ) {
        $this->close( $k ,$this->users[$k]['name']);
        $ar['type']  = 'remove';
        $ar['message'] = $k;
        $this->send1( false , $ar , 'all' );
    }

    function e( $str ) {
        $str = $str . "\n";
        echo iconv( 'utf-8' , 'gbk//IGNORE' , $str );
    }
}